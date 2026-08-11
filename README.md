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
Dólar Americano (USD) Todos os Boletins [Bacen]: https://dadosabertos.bcb.gov.br/dataset/dolar-americano-usd-todos-os-boletins-diarios
\
Developers B3: https://developers.b3.com.br/
\
ANBIMA Data: https://data.anbima.com.br/
\
Fazenda SP: https://portal.fazenda.sp.gov.br/acessoinformacao/Paginas/Consultas.aspx
\
Fazenda SP API: https://webservices.fazenda.sp.gov.br/WSTransparencia/TransparenciaServico.asmx
\
Portal do Investidor: https://www.investidor.gov.br/menu/Investidor_Estrangeiro/DadosEstatisticosEconomicosBrasil.html
\
Instituições Financeiras: https://www3.bcb.gov.br/ifdata/
\
Códigos ISIN: https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/consultas/mercado-a-vista/codigo-isin/pesquisa/
\
CVM - Informação Cadastral de Fundos de Investimento: https://dados.cvm.gov.br/dataset/fi-cad
\
CVM - Extrato de Fundos de Investimento: https://dados.cvm.gov.br/dataset/fi-doc-extrato
\
Agregados IBGE (Lista de Tabelas do SIDRA) [JSON]: https://servicodados.ibge.gov.br/api/v3/agregados
\
Pesquisas IBGE (Lista de Pesquisas Gerais) [JSON]: https://servicodados.ibge.gov.br/api/v3/pesquisas
\
Metadados de uma Tabela IBGE (Ex: 7060) [JSON]: https://servicodados.ibge.gov.br/api/v3/agregados/7060/metadados
\
Metadados Estatísticos do IBGE (Catálogo Conecta): https://apimetadados.ibge.gov.br/


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
Selic Acumulada no Mês (JSON) [IPEA]: http://ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='BM12_TJOVER12')
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
IPCA-15 Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.7478/dados?formato=json
\
IMAB Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.12466/dados?formato=json
\
IMAB5 Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.12467/dados?formato=json
\
IMAB5+ Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.12468/dados?formato=json
\
CDI Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json
\
CDI Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?formato=json
\
Selic Diário (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json
\
Selic Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json
\
IGP-M Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json
\
TR Mês (JSON) [Bacen]: https://api.bcb.gov.br/dados/serie/bcdata.sgs.226/dados?formato=json
\
Índices Amplos (HTML) [B3]: https://www.b3.com.br/pt_br/market-data-e-indices/indices/
\
Índices de Segmentos e Setoriais (HTML) [B3]: https://www.b3.com.br/pt_br/market-data-e-indices/indices/indices-de-segmentos-e-setoriais/
\
Valores de Séries Históricas (IPCA/INPC/IPCA-15 por Grupo de Produtos via SIDRA API) [JSON]: https://apisidra.ibge.gov.br/values/t/{ID_TABELA}/v/63/p/all/c315/{ID_GRUPO}/{CODIGO_TERRITORIO}
\
Exemplo (São Paulo): https://apisidra.ibge.gov.br/values/t/7060/v/63/p/all/c315/7169,7170,7445,7486,7558,7625,7660,7712,7766,7786/n7/3501
\
Exemplo (Achar código RM do Estado): https://apisidra.ibge.gov.br/values/t/7060/v/63/p/last%201/n7/all
\
Visualização Web - Tabela 7060 (IPCA - Jan/2020 ao presente) [IBGE]: https://sidra.ibge.gov.br/tabela/7060
\
Visualização Web - Tabela 1419 (IPCA - Jan/2012 a Dez/2019) [IBGE]: https://sidra.ibge.gov.br/tabela/1419
\
Visualização Web - Tabela 2938 (IPCA - Jul/2006 a Dez/2011) [IBGE]: https://sidra.ibge.gov.br/tabela/2938
\
Visualização Web - Tabela 655 (IPCA - Ago/1999 a Jun/2006) [IBGE]: https://sidra.ibge.gov.br/tabela/655


### AÇÕES/FIIs

#### Yahoo Finance
\- Info: https://rapidapi.com/apidojo/api/yahoo-finance1
\
\- https://query1.finance.yahoo.com/v8/finance/chart/BOVA11.SA?interval=1h&period1=1577847600&period2=1609469999&events=div,splits&includePrePost=true
\
\- interval = 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
\
\- period1/period2 = min/max Unix Time

#### Alpha Vantage
\- Info: https://rapidapi.com/alphavantage/api/alpha-vantage
\
\- https://www.alphavantage.co/query?apikey={API_KEY}&function=TIME_SERIES_DAILY_ADJUSTED&symbol=BOVA11.SA&datatype=json&outputsize=full

#### EODHD
\- https://eodhd.com/financial-apis/api-for-historical-data-and-volumes

#### brapi
\- Info: https://brapi.ga/docs
\
\- https://brapi.ga

#### IEX Trading
\- https://iextrading.com/


### AÇÕES - FUNDAMENTALISTA

Dados B3 (API REST + MCP) - Info: https://dados-b3.onrender.com
Fundamentus: https://fundamentus.com.br/
\
Oceans14: https://www.oceans14.com.br/
\
Fundamentei: https://fundamentei.com/


### TESOURO DIRETO

Histórico de Preços (CSV) [Tesouro Nacional]: https://sisweb.tesouro.gov.br/apex/f?p=2031:2:
\
Histórico de Preços (CSV) [Tesouro Transparente]: https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto
\
Histórico de Preços (CSV) [Tesouro Direto]: https://www.tesourodireto.com.br/titulos/historico-de-precos-e-taxas.htm
\
Histórico de Preços (CSV) [Dados Abertos Gov]: https://dados.gov.br/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto1
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


### CRYPTO

Yahoo Finance: https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?interval=1d&period1=1640995200&period2=1651363200&events=div,splits&includePrePost=true


### SERVIÇOS PROFISSIONAIS

Comdinheiro: https://comdinheiro.com.br
\
APIs Fintz: https://fintz.com.br
\
Algoseek: https://www.algoseek.com
\
Dados de Mercado API: https://www.dadosdemercado.com.br/api/docs


### PACOTES

##### PYTHON
InvestPy: https://github.com/alvarobartt/investpy
\
yfinance: https://github.com/ranaroussi/yfinance
\
DadosAbertosBrasil: https://github.com/GusFurtado/DadosAbertosBrasil

##### NODE.JS
CEI Crawler: https://github.com/Menighin/cei-crawler

##### R 
[GetDFPData2](https://github.com/msperlin/GetDFPData2): Financial Statements (asset/liabilities/cashflow) from the DFP (demonstrativos financeiros padronizados) for companies traded at B3/Brazil
\
[GetFREData](https://github.com/msperlin/GetFREData): Corporate information from the FRE (formulario de referencia) system (B3/Brazil)
\
[yfR](https://github.com/msperlin/yfR): Imports prices and returns of stocks and indices from Yahoo Finance (any global market)
\
[simfinapi](https://github.com/matthiasgomolka/simfinapi): Wraps the [https://simfin.com/](https://simfin.com/) Web-API to make ‘SimFin’ financial statements 
\
[GetTDData](https://github.com/msperlin/GetTDData): Imports prices and yields from Tesouro direto website
\
[rb3](https://github.com/wilsonfreitas/rb3): Imports historical yield curves from B3
\
[GetBCBData](https://github.com/msperlin/GetBCBData): Import data from the SGS system of Brazilian Central Bank
\
[rbcb](https://github.com/wilsonfreitas/rbcb): R interface to Brazilian Central Bank web services (same data source as GetBCBData).
\
[Tutorial RPubs (Séries Temporais/Finanças)](https://rpubs.com/frank-pinho/517779): Exemplo prático de extração de dados no R


### Sites

Considere a Inflação: https://www.considereainflacao.com.br/ (https://github.com/danielbm/considere)
\
Dados Abertos Brasil: https://www.gustavofurtado.com.br/dab.html (https://github.com/GusFurtado/DadosAbertosBrasil)
\
DrCalc.net: http://drcalc.net/
\
Escola do Financeiro: https://escoladofinanceiro.com/investimentos-no-brasil/
\
FEA USP - Fontes de Informação e Bases de Dados: https://www.fea.usp.br/biblioteca/fontes-de-informacao/base-de-dados
\
FXGears (Historical Data for Algo Trading): https://fxgears.com/index.php?threads/how-to-acquire-free-historical-tick-and-bar-data-for-algo-trading-and-backtesting-in-2020-stocks-forex-and-crypto-currency.1229/#post-19305