# Fontes de Dados Financeiros

### METADADOS
ipeadata: http://ipeadata.gov.br/
\
ipeadata API: http://ipeadata.gov.br/api/
\
ipeadata API Metadados: http://www.ipeadata.gov.br/api/odata4/Metadados
\
Tesouro Transparente: https://www.tesourotransparente.gov.br/ckan/dataset
\
Dados Abertos Gov: https://dados.gov.br/dataset
\
Dados Abertos Bacen: https://dadosabertos.bcb.gov.br/
\
Bacen SGS: https://www3.bcb.gov.br/sgspub/localizarseries/localizarSeries.do?method=prepararTelaLocalizarSeries
\
Bacen SGS Tutorial: https://dadosabertos.bcb.gov.br/dataset/25436-taxa-media-mensal-de-juros-das-operacoes-de-credito-com-recursos-livres---total/resource/da27b06a-201d-433b-8351-d9987e3d6487
\
Developers B3: https://developers.b3.com.br/
\
ANBIMA Data: https://data.anbima.com.br/

### ÍNDICES
IPCA Anualizado (JSON) [IPEA]: http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='PAN12_IPCAG12')
\
IPCA Anualizado (GRÁFICO) [IPEA]: http://www.ipeadata.gov.br/ExibeSerie.aspx?serid=38391
\
IPCA Mês (JSON) [IPEA]: http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='PRECOS12_IPCAG12')
\
IPCA Expectativa 12 Meses (JSON) [IPEA]: http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='BM12_IPCAEXP1212')
\
Selic Mês (JSON) [IPEA]: http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='PAN12_TJOVER12')
\
Selic Mês (GRÁFICO) [IPEA]: http://www.ipeadata.gov.br/exibeserie.aspx?serid=38402
\
CDI Mês (JSON) [IPEA]: http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='BM12_TJCDI12')
\
IGP-M Mês (JSON) [IPEA]: http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='IGP12_IGPMG12')
\
Selic Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json&dataInicial=01/01/2020&dataFinal=31/12/2020
\
Selic Diário/Anual (HTML) [Bacen]: https://www.bcb.gov.br/htms/SELIC/SELICdiarios.asp?frame=1
\
Calculadora do Cidadão (HTML) [Bacen]: https://www3.bcb.gov.br/CALCIDADAO/publico/corrigirPorIndice.do?method=corrigirPorIndice
\
Calculadora do Cidadão (HTML) [Bacen]: curl -X POST -H "Content-Type: application/x-www-form-urlencoded" --data "aba=1&selIndice=00433IPC-A&dataInicial=01/2020&dataFinal=12/2020&valorCorrecao=1%2C00&idIndice=&nomeIndicePeriodo=" https://www3.bcb.gov.br/CALCIDADAO/publico/corrigirPorIndice.do?method=corrigirPorIndice
\
IPCA Mês (JSON) [Bacen]: http://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json
\
CDI Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json
\
CDI Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?formato=json
\
Selic Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json
\
Selic Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json
\
IGM-M Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json
\
TR Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.226/dados?formato=json

### AÇÕES/FIIs
Yahoo Finance:
\
\- Info: https://rapidapi.com/apidojo/api/yahoo-finance1
\
\- https://query1.finance.yahoo.com/v8/finance/chart/BOVA11.SA?interval=1h&period1=1577847600&period2=1609469999&events=div,splits&includePrePost=true
\
\- interval = 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
\
\- period1/period2 = min/max Unix Time
\
Alpha Vantage:
\
\- Info: https://rapidapi.com/alphavantage/api/alpha-vantage
\
\- https://www.alphavantage.co/query?apikey={API_KEY}&function=TIME_SERIES_DAILY_ADJUSTED&symbol=BOVA11.SA&datatype=json&outputsize=full

### TESOURO DIRETO
Histórico de Preços (CSV) [Tesouro Nacional]: https://sisweb.tesouro.gov.br/apex/f?p=2031:2:
\
Histórico de Preços (CSV) [Tesouro Transparente]: https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto
\
Histórico de Preços (CSV) [Tesouro Direto]: https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm
\
Preços D0 (HTML) [Tesouro Direto]: https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm
\
Preços D0 (JSON) [Tesouro Direto]: https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json
\
Rentabilidade Antecipada (HTML) [Tesouro Nacional]: https://sisweb.tesouro.gov.br/apex/f?p=2031:1:
\
IMA - Índice de Mercado ANBIMA (HTML) [ANBIMA]: https://www.anbima.com.br/informacoes/ima/ima-carteira-teorica.asp

### TÍTULOS PRIVADOS
CRI/CRA (HTML) [ANBIMA Data]: https://data.anbima.com.br/certificado-de-recebiveis
\
Debêntures (HTML) [ANBIMA Data]: https://data.anbima.com.br/debentures

### FUNDOS DE INVESTIMENTO
Dados de Fundos (HTML) [ANBIMA Data]: https://data.anbima.com.br/fundos
