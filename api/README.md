# Centralizador de Dados Financeiros

Esta aplicação é uma API que centraliza dados financeiros, com foco nos dados disponíveis no [repositório dados-financeiros](https://github.com/Tpessia/dados-financeiros).

## Funcionalidades

- Busca de dados financeiros por códigos de ativos.
- Suporte para diferentes tipos de ativos, incluindo taxas de juros, índices de inflação, ações, fundos de investimento e moedas.
- Transformação e alavancagem de dados conforme especificado nos códigos dos ativos.

## Endpoints

### Buscar Dados Financeiros

#### `GET /search`

Busca dados financeiros com base nos códigos dos ativos, data mínima e data máxima.

**Parâmetros de Query:**

- `assetCodes` (string, obrigatório): Códigos dos ativos, por exemplo: `TSLA`, `BOVA11.SA:USDBRL`, `IPCA.SA`, `FIXED*0.1`, `SELIC.SA*0.9`.
- `minDate` (string, obrigatório): Data mínima no formato `YYYY-MM-DD`, por exemplo: `2020-01-01`.
- `maxDate` (string, obrigatório): Data máxima no formato `YYYY-MM-DD`, por exemplo: `2020-01-31`.

**Exemplo de Request:**

```http
GET /search?assetCodes=IPCA,SELIC*0.9,BOVA11.SA:USDBRL&minDate=2020-01-01&maxDate=2020-01-31
```