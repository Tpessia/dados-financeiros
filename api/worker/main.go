// docker run -it --rm golang:1.25.5-alpine3.23
// go build -o worker .

package main

import (
	"bufio"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

type AssetPrice struct {
	AssetType    string  `json:"assetType"`
	MaturityDate string  `json:"maturityDate"`
	Date         string  `json:"date"`
	BuyRate      float64 `json:"buyRate"`
	SellRate     float64 `json:"sellRate"`
	BuyPu        float64 `json:"buyPu"`
	SellPU       float64 `json:"sellPu"`
	BasePU       float64 `json:"basePu"`
	AssetCode    string  `json:"assetCode"`
	Value        float64 `json:"value"`
	Currency     string  `json:"currency"`
}

type AssetError struct {
	Data  string `json:"data"`
	Error string `json:"error"`
}

func main() {
	// Tipo Titulo;Data Vencimento;Data Base;Taxa Compra Manha;Taxa Venda Manha;PU Compra Manha;PU Venda Manha;PU Base Manha
	// Tesouro IPCA+ com Juros Semestrais;15/05/2045;29/09/2010;5,95;6,05;1994,20;1966,65;1965,90

	stdoutW := bufio.NewWriter(os.Stdout)
	defer stdoutW.Flush()
	stdoutJSON := json.NewEncoder(stdoutW)

	stderrW := bufio.NewWriter(os.Stderr)
	defer stderrW.Flush()
	stderrJSON := json.NewEncoder(stderrW)

	count := 0

	processCSV := func(row []string) error {
		count++
		if count == 1 {
			// Skip header row
			return nil
		}

		// Map asset type codes to full names
		assetTypeMap := map[string]string{
			"Tesouro Selic":                          "LFT",     // Selic
			"Tesouro Prefixado":                      "LTN",     // Pre
			"Tesouro Prefixado com Juros Semestrais": "NTN-F",   // Pre Juros
			"Tesouro IPCA+":                          "NTN-B-P", // IPCA
			"Tesouro IPCA+ com Juros Semestrais":     "NTN-B",   // IPCA Juros
			"Tesouro IGPM+ com Juros Semestrais":     "NTN-C",   // IGP-M
			"Tesouro Renda+ Aposentadoria Extra":     "NTN-R",   // Renda+
			"Tesouro Educa+":                         "NTN-E",   // Educa+
		}

		// fmt.Println(row)

		assetPrice := AssetPrice{Currency: "BRL"}
		assetErrors := []error{}

		assetType, ok := assetTypeMap[row[0]]
		if ok {
			assetPrice.AssetType = assetType
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("unknown asset type: %s", row[0]))
		}

		maturityDate, err := time.Parse("02/01/2006", row[1])
		if err == nil {
			assetPrice.MaturityDate = fmt.Sprintf("%sT00:00:00Z", maturityDate.Format("2006-01-02"))
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("invalid dueDate format: %s", row[1]))
		}

		if assetType != "" && !maturityDate.IsZero() {
			assetCode := fmt.Sprintf("%s/%s", assetType, maturityDate.Format("2006"))
			assetPrice.AssetCode = assetCode
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("cannot generate asset code: type=%s, dueDate=%s", row[0], row[1]))
		}

		baseDate, err := time.Parse("02/01/2006", row[2])
		if err == nil {
			assetPrice.Date = fmt.Sprintf("%sT00:00:00Z", baseDate.Format("2006-01-02"))
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("invalid baseDate format: %s", row[2]))
		}

		buyRate, err := castPercent(strings.ReplaceAll(row[3], ",", "."))
		if err == nil {
			assetPrice.BuyRate = buyRate
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("invalid buyRate format: %s", row[3]))
		}

		sellRate, err := castPercent(strings.ReplaceAll(row[4], ",", "."))
		if err == nil {
			assetPrice.SellRate = sellRate
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("invalid sellRate format: %s", row[4]))
		}

		buyPU, err := strconv.ParseFloat(strings.ReplaceAll(row[5], ",", "."), 64)
		if err == nil {
			assetPrice.BuyPu = buyPU
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("invalid buyPU format: %s", row[5]))
		}

		sellPU, err := strconv.ParseFloat(strings.ReplaceAll(row[6], ",", "."), 64)
		if err == nil {
			assetPrice.SellPU = sellPU
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("invalid sellPU format: %s", row[6]))
		}

		basePU, err := strconv.ParseFloat(strings.ReplaceAll(row[7], ",", "."), 64)
		if err == nil {
			assetPrice.BasePU = basePU
		} else {
			assetErrors = append(assetErrors, fmt.Errorf("invalid basePU format: %s", row[7]))
		}

		if len(assetErrors) > 0 {
			assetError := AssetError{
				Data:  strings.Join(row, ";"),
				Error: fmt.Sprintf("row %d errors: %v", count, assetErrors),
			}
			stderrJSON.Encode(assetError)
			return nil
		}

		assetPrice.Value = assetPrice.BuyPu

		stdoutJSON.Encode(assetPrice)
		return nil
	}

	err := streamCSV("https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv", processCSV)
	if err != nil {
		fmt.Println("Error streaming CSV:", err)
		return
	}
}

func streamCSV(url string, handle func([]string) error) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		data, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		return fmt.Errorf("http %d: %s", resp.StatusCode, strings.TrimSpace(string(data)))
	}

	csvReader := csv.NewReader(resp.Body)
	csvReader.Comma = ';'
	csvReader.FieldsPerRecord = -1 // allow variable number of fields

	for {
		// Read each record from csv
		record, err := csvReader.Read()

		// Break at end of file
		if err == io.EOF {
			break
		}

		// Handle other errors
		if err != nil {
			return err
		}

		// Process the record
		err = handle(record)
		if err != nil {
			return err
		}
	}

	return nil
}

func castPercent(s string) (float64, error) {
	r := new(big.Rat)

	if _, ok := r.SetString(s); !ok {
		return 0, fmt.Errorf("invalid decimal string")
	}

	r.Quo(r, big.NewRat(100, 1))

	out, _ := r.Float64()
	// if !exact {
	// 	return out, fmt.Errorf("precision loss converting to float64")
	// }

	return out, nil
}
