const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.secret_key,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const now = () => new Date().toISOString();

const newNode = (title, type, description, content, tags, parent_id) => ({
  id: uuidv4(),
  title,
  type,
  description,
  content,
  tags,
  parent_id: parent_id || null,
  pos_x: 0,
  pos_y: 0,
  created_at: now(),
  updated_at: now(),
});

// ─── IDs existentes no banco ───────────────────────────────────────────────
const CPI_PASTA       = 'b372ef6e-4f9f-432f-a196-b4c3b451751f';
const IFLOWS_AREA     = '12827528-f7af-484a-9997-55414b762e67';
const ADAPTERS_AREA   = 'e55ac56d-a416-4c37-a607-42daea0946b0';
const MAIL_NODE       = '2ed1d052-0c9e-48fe-9f48-d8c3f4037463';
const ODATA_NODE      = '76ee2c69-ac76-4cd5-b0d0-5ad68b14ecc9';

const CDS_PASTA       = 'dcd34335-866e-4207-bb49-d3d270298362';
const ESTRUTURA_AREA  = '52f2cebe-5ecb-4b9b-8670-9ec8accbc299';
const ANNOTATIONS_AREA= 'acef1f17-5ef7-4925-a2d2-907e67ee8fe4';
const ASSOC_AREA      = '2b022be2-a69a-4d27-aa31-1dd0e3a42667';
const VDM_AREA        = 'ffe58266-6570-408b-a56a-72982ae2236a';
const CAST_NODE       = '6e0dbad0-ba18-4e4a-9373-9d23cf638b3c';
const ASSOC_NODE      = 'c0219988-f073-4f46-9dc0-e474130d1c58';
const EXTVIEW_NODE    = '04a1fa39-431e-4d30-9492-029e71607f4c';

// ─── Conteúdos markdown ────────────────────────────────────────────────────

const MD_SETUP_TRIAL = `## Setup Inicial do CPI — Ambiente Trial

### 1. Criar Conta Trial
Acesse: https://account.hanatrial.ondemand.com/
Crie sua conta gratuita na SAP BTP Trial.

### 2. Ativar o Cloud Foundry
- Na subaccount trial, habilitar o ambiente **Cloud Foundry**
- Definir a organização e o espaço (space)

### 3. Criar Instância do Integration Suite
- Ir em **Instances and Subscriptions**
- Clicar em **Create** → Subscribir ao **SAP Integration Suite**

### 4. Adicionar Permissões ao Usuário
- Ir em **Security → Users**
- Atribuir os roles necessários:
  - \`IntegrationDeveloper\` — para desenvolver iFlows
  - \`MonitoringAndOperationsUser\` — para monitorar execuções
  - \`AuthGroup_IntegrationDeveloper\` — acesso completo ao design time`;

const MD_CLIENT_ID = `## Criando Client ID e Secret (OAuth2 Client Credentials)

Usado para consumo externo de iFlows via Postman, aplicações ou sistemas.

### Passo a Passo

1. Entrar na **Subaccount Trial**
2. Ir em **Instances and Subscriptions → aba Instances → Create**
3. Preencher:
   - **Serviço:** \`process integration runtime\`
   - **Plan:** \`integration-flow\`
   - **Instance Name:** nome de sua escolha
4. Clicar em **Next**
   - **Role:** verificar no iFlow qual role está configurada
     *(clicar na linha que conecta o Sender → aba Connection → campo User Role)*
   - **Grant Types:** \`client_credentials\`
5. Revisar e clicar em **Create**

### Criando a Service Key

1. Clicar na instância criada → **Service Keys → Create**
2. Preencher:
   - Nome da key
   - Key Type: **ClientID/Secret**
   - Validade e tamanho (opcionais)
3. Para visualizar: clicar nos **⋮ → View**

### Usando no Postman

| Campo | Valor |
|---|---|
| Authorization Type | Basic Auth |
| Username | Client ID |
| Password | Client Secret |

> **Conceito:** OAuth2 Client Credentials Flow é usado quando um sistema precisa se autenticar sem interação do usuário. O Client ID identifica a aplicação; o Client Secret funciona como sua senha.`;

const MD_VERSIONAMENTO = `## Versionamento e Gerenciamento de iFlows

### Versionamento

- Em **Integrations and APIs → Artifacts**
- Clicar em **Version** na linha do iFlow
- Lista todas as versões salvas com data/hora
- Clicar em uma versão para restaurá-la

> Salve uma versão antes de qualquer alteração significativa — é o equivalente a um commit.

---

### Renomear um iFlow

1. **Integrations and APIs → Artifacts**
2. Clicar em **Actions (⋮)** na linha do iFlow
3. Ir em **View Metadata**
4. Editar: **Nome**, Descrição, Integration Flow, Sender, Receiver
5. Salvar

---

### Renomear um Pacote

1. Clicar no **pacote** desejado
2. Clicar em **Edit**
3. Acessar a aba **Header**
4. Editar: Nome, Descrição, Vendor, Version
5. Salvar`;

const MD_CONTENT_MODIFIER = `## Content Modifier

O Content Modifier é um dos steps mais usados em iFlows — permite criar, ler e modificar propriedades da mensagem em trânsito.

---

### Criando uma Propriedade com XPath

Útil para extrair valores de um payload XML e guardá-los como variáveis reutilizáveis.

1. Adicionar o step **Content Modifier** no iFlow
2. Aba **Exchange Property → Add**
3. Preencher:

| Campo | Valor |
|---|---|
| Name | \`_nomeDaPropriedade\` (convenção: prefixo \`_\`) |
| Source Type | \`XPath\` |
| Source Value | caminho no XML, ex: \`/pedido/numero\` |
| Data Type | \`java.lang.String\` |
| Default Value | (opcional) |

4. Para usar a propriedade em um **Message Body:**
\`\`\`
\${property._nomeDaPropriedade}
\`\`\`

---

### Converter XML → JSON

- Adicionar o step **Converter → XML to JSON**
- Se o content-type de entrada não for detectado automaticamente, setar:
  - Source Value: \`application/xml\`

---

### Converter CSV → XML

1. Gerar um schema **XSD** baseado no XML esperado (via ferramentas online)
2. No Converter:
   - Upload do XSD em **XML Schema**
   - **Path to Target Element in XSD:** ex: \`/clientes/data/row\`
3. Manter um Content Modifier no final para ajustar o payload

---

### Converter XML → CSV

- No Converter (XML to CSV), informar o caminho de preenchimento no CSV

---

### Enviar CSV para FTP

1. Criar credencial no **Manage Security Material** com dados do servidor FTP
2. No iFlow:
   - Criar um **Receiver**
   - Adicionar step **External → Send** conectado ao Receiver
   - Tipo de adaptador: **FTP**
3. Configurações:

| Campo | Valor |
|---|---|
| Address | endereço do servidor FTP |
| Credential Name | nome cadastrado no Security Material |
| Directory | caminho de destino no servidor |
| File Name | nome do arquivo de saída |`;

const MD_REQUEST_REPLY = `## Request Reply — Padrão de Integração (EIP)

### O que é?

**Request Reply** é um padrão de Enterprise Integration Patterns (EIP) onde uma mensagem é enviada a um sistema externo e o iFlow **aguarda a resposta** antes de continuar o processamento.

É o padrão **síncrono** por excelência.

### Quando usar

- Consultas a APIs externas onde o resultado alimenta o próximo step
- Chamadas OData (GET, POST, PUT, DELETE)
- Chamadas REST onde o response é necessário para continuar o fluxo
- Qualquer integração onde a resposta importa no momento da execução

### Como criar no CPI

1. No iFlow, adicionar step **Request Reply** (em *Call → External*)
2. Criar um **Receiver** e conectar ao Request Reply
3. Na linha de conexão, configurar o adaptador:
   - OData V2 / V4
   - HTTP / REST
   - SOAP
4. O resultado da chamada volta automaticamente como body da mensagem

### Diferença: External Call vs Request Reply

| | External Call | Request Reply |
|---|---|---|
| Aguarda resposta? | Não obrigatoriamente | Sim, sempre |
| Uso típico | Envio de email, fire-and-forget | Consulta OData, REST com retorno |
| Resultado alimenta o fluxo? | Não | Sim |

### Padrão contrário: Fire and Forget
Quando o envio não precisa de resposta (ex: enviar um email), usa-se o **External Call** sem esperar retorno.`;

const MD_MAIL_ADAPTER = `## Mail Adapter — Enviando Email via iFlow

### Pré-requisito
Cadastrar as credenciais SMTP no **Security Material** antes de configurar o canal.

---

### Estrutura no iFlow

\`\`\`
[Sender] → [Processo] → [External Call] ---adaptador Mail---> [Receiver: Gmail]
\`\`\`

1. Criar step **External Call** (*Call → External*)
2. Criar um **Receiver** (ex: Gmail)
3. Conectar External Call ao Receiver
4. Clicar na **linha tracejada** para abrir as configurações do canal

---

### Aba Connection

| Campo | Valor |
|---|---|
| Address | servidor SMTP, ex: \`smtp.gmail.com\` |
| Proxy Type | \`Internet\` |
| Timeout | \`Default\` |
| Protection | \`SMTPS\` |
| Authentication | \`Encrypted User/Password\` |
| Credential Name | nome cadastrado no Security Material |

---

### Aba Processing

| Campo | Descrição |
|---|---|
| From | endereço do remetente |
| To | destinatário(s) — separados por vírgula |
| Cc / Bcc | cópias |
| Subject | assunto do email |
| Body | corpo — suporta expressões \`\${property._variavel}\` |
| Attachments | arquivos anexos (opcional) |

---

### Dica para Gmail
Para usar Gmail como SMTP, é necessário:
- Habilitar verificação em 2 etapas na conta Google
- Gerar uma **App Password** (Senha de App) e usar essa senha no Security Material
- Host: \`smtp.gmail.com\` | Porta: 465 (SMTPS) ou 587 (TLS)`;

const MD_ODATA_ADAPTER = `## OData Adapter — Conexão OData via Request Reply

### Estrutura no iFlow

\`\`\`
[Sender] → [Message Mapping] → [Request Reply] ---OData V2/V4---> [Receiver: API]
\`\`\`

---

### Configuração do Request Reply + OData

1. Adicionar step **Request Reply** no iFlow
2. Criar um **Receiver** e conectar
3. Tipo de adaptador: **OData V2** ou **OData V4**

#### Aba Connection
| Campo | Valor |
|---|---|
| Address | URL base da API OData, ex: \`https://host/sap/opu/odata/sap/API_SALES_ORDER\` |

#### Aba Processing
| Campo | Descrição |
|---|---|
| Operation Details | método HTTP: GET, POST, PUT, DELETE |
| Resource Path | clicar em **Select** para abrir o Model Operation |

**Model Operation — como buscar o modelo:**
- **Por arquivo EDMX:** upload manual do arquivo baixado do API Business Hub
- **Por URL:** informa a URL do \`$metadata\` — puxa automaticamente
- Selecionar: Entidade, Sub-nível (expand), filtros Top/Skip/\$filter/\$orderby

---

### ⚠️ Content-Type — Atenção Importante
Sempre passar \`Content-Type: application/json\` após o Request Reply.
Sem isso, campos podem retornar nulos ou a conversão falha.

---

### Message Mapping para OData

1. Antes do Request Reply, adicionar um **Message Mapping**
2. Dentro do mapping, clicar em **criar**
3. Em **Add Target Message**: usar o XSD gerado pelo próprio Request Reply
4. Fazer o mapeamento dos campos fonte → destino graficamente

---

### Definindo o Método HTTP (GET/POST/PUT/DELETE)

O método é definido:
1. Diretamente no **Request Reply** (Operation Details)
2. No Postman/cliente: alterar o verbo HTTP conforme configurado no CPI

---

### SOAP UI — Ferramenta para Testes SOAP

Para serviços **SOAP** (Web Services com WSDL), usar o **SOAP UI**:
1. Criar projeto → informar URL do WSDL
2. SOAP UI importa as operações automaticamente
3. Montar o payload XML e executar
4. Visualizar request/response para validação`;

const MD_SECURITY_MATERIAL = `## Security Material — Cofre de Credenciais do CPI

### Para que serve?

Armazenar de forma segura qualquer credencial que os iFlows precisam acessar:
- Usuário e senha de email (SMTP)
- Credenciais de servidores FTP/SFTP
- Tokens e API Keys de sistemas externos
- Certificados digitais X.509
- OAuth2 Client Credentials

### Como Acessar

> **Monitor → Integrations and APIs → Manage Security → Security Material**

---

### Como Cadastrar uma Credencial

1. Clicar em **Add**
2. Escolher o tipo:

| Tipo | Uso |
|---|---|
| User Credentials | usuário + senha (SMTP, FTP, etc.) |
| OAuth2 Client Credentials | client_id + client_secret |
| Secure Parameter | valor único (token, API key) |
| Certificate | certificado X.509 |

3. Definir um **nome** — será referenciado nos iFlows
4. Preencher os dados e salvar

---

### Usando nos iFlows

Nos adaptadores (Mail, FTP, HTTP, etc.), no campo **Credential Name**, informar exatamente o nome cadastrado aqui.

> O CPI nunca expõe a credencial no código — apenas a referencia pelo nome.`;

const MD_CONNECTIVITY_TESTS = `## Connectivity Tests — Testando Conexões no CPI

### Como Acessar

> **Monitor → Integrations and APIs → Manage Security → Connectivity Tests**

---

### Para que serve?

- Testar conectividade com servidores externos antes de montar o iFlow
- Validar se credenciais e certificados estão corretos
- Gerar/obter certificados de sites para adicionar no Security Material

---

### Adaptadores que podem ser testados

- FTP / SFTP
- SMTP (email)
- HTTP / HTTPS
- IDoc
- RFC
- e outros conforme a tenant

---

### Como usar

1. Selecionar o **tipo de adaptador**
2. Preencher os dados de conexão (host, porta, protocolo)
3. Clicar em **Send** ou **Test**
4. O resultado mostra:
   - ✅ Conexão bem-sucedida
   - ❌ Erro detalhado (timeout, certificado inválido, credencial incorreta)

---

### Gerando Certificados para o Keystore

Para conexões HTTPS, é possível:
1. Informar a URL do servidor no teste
2. Fazer o download do certificado do servidor
3. Adicionar diretamente em **Security Material → Keystore**

Isso resolve erros de certificado desconhecido em chamadas HTTPS de iFlows.`;

const MD_SOAP_UI = `## SOAP UI — Ferramenta para Testes de Web Services

### O que é?

**SOAP UI** é uma aplicação desktop para testar Web Services (SOAP) e APIs REST.
Muito usada para validar payloads antes de configurar iFlows no CPI.

### Download
https://www.soapui.org/

---

### Casos de Uso

- Testar chamadas **SOAP** com autenticação WS-Security
- Simular requests para validar o iFlow antes de integração real
- Verificar o payload XML de request/response
- Criar **mock services** para simular sistemas externos

---

### Como usar (SOAP básico)

1. Criar um novo projeto SOAP
2. Informar a URL do **WSDL** do serviço
3. SOAP UI importa automaticamente todas as operações disponíveis
4. Selecionar a operação, montar o payload XML
5. Clicar em **Run (▶)** e visualizar o response

---

### Alternativas modernas

| Ferramenta | Foco | Observação |
|---|---|---|
| Postman | REST / OData / GraphQL | Mais usado atualmente |
| Bruno | REST (open-source) | Alternativa ao Postman, armazena collections em Git |
| Insomnia | REST / GraphQL | Boa opção gratuita |

> Para chamadas **OData e REST** no contexto CPI, o **Postman** é a ferramenta mais prática.`;

const MD_CAST_UPDATE = `## CASE / CAST / COALESCE em CDS

### CAST — Conversão de Tipos

Converte um campo de um tipo de dado para outro — equivalente ao CAST do SQL padrão.

**Sintaxe:**
\`\`\`sql
cast( NomeCampo as tipo_destino ) as NomeAlias
\`\`\`

**Exemplos:**
\`\`\`sql
cast( Quantidade as abap.dec(13,3) ) as Quantidade,
cast( DataDocumento as abap.dats )   as DataDocumento,
cast( '0' as abap.numc(4) )          as ValorFixo
\`\`\`

**Quando usar:**
- Campo da tabela não tem o tipo exato esperado pela view consumidora
- Comparações entre campos de tipos diferentes
- Garantir precisão em cálculos numéricos

---

### CASE — Condicional

\`\`\`sql
case Status
  when 'A' then 'Ativo'
  when 'I' then 'Inativo'
  else          'Desconhecido'
end as StatusDescricao
\`\`\`

**CASE com condição (searched CASE):**
\`\`\`sql
case
  when Quantidade > 0 then 'Com Estoque'
  else                     'Sem Estoque'
end as SituacaoEstoque
\`\`\`

---

### COALESCE — Valor Padrão para Nulos

Retorna o primeiro valor não-nulo da lista:

\`\`\`sql
coalesce( NomeFantasia, RazaoSocial, 'Sem Nome' ) as NomeExibicao
\`\`\`

---

### Combinando CAST + CASE

\`\`\`sql
cast(
  case when Ativo = 'X' then '1' else '0' end
  as abap.int1
) as AtivoNumerico
\`\`\``;

const MD_CODE_PUSHDOWN = `## Code Pushdown — Lógica no Banco, não no Servidor

### O Conceito

**Code Pushdown** é o princípio de mover o processamento de dados do **servidor de aplicação (ABAP)** para o **banco de dados (HANA)**.

---

### Como era no ECC (ABAP clássico)

\`\`\`abap
" Buscava TUDO e filtrava no ABAP
SELECT * FROM vbak INTO TABLE lt_vbak.
LOOP AT lt_vbak INTO ls_vbak WHERE ...  " filtro tardio
\`\`\`

- Dados viajavam em massa do banco → servidor ABAP
- Filtros, agrupamentos e cálculos feitos em código ABAP
- Alto consumo de memória e CPU no app server

---

### Como é no S/4HANA (Code Pushdown com CDS)

\`\`\`sql
-- A lógica fica dentro da CDS View
define view ZVendas as select from vbak
  inner join vbap on vbak.vbeln = vbap.vbeln
{
  vbak.vbeln,
  sum( vbap.kwmeng ) as TotalQuantidade,   -- agregação no banco
  case vbak.auart when 'OR' then 'Padrão' else 'Outro' end as TipoPedido
}
group by vbak.vbeln, vbak.auart
\`\`\`

- O HANA executa: joins, filtros, agregações, cálculos
- O ABAP recebe apenas o resultado final
- Muito menos dados trafegam pela rede

---

### O que empurrar para o banco (exemplos)

| Antes (ABAP ECC) | Agora (CDS/HANA) |
|---|---|
| \`FOR ALL ENTRIES\` | \`JOIN\` na CDS |
| \`IF/ENDIF\` para derivar campos | \`CASE\` na CDS |
| \`COLLECT\` / somatórias | \`SUM/COUNT\` + \`GROUP BY\` |
| \`MOVE-CORRESPONDING\` de tipos | \`CAST\` na CDS |
| \`APPEND\` combinando tabelas | \`UNION\` na CDS |

---

### Regra de ouro
> *"Tudo que o banco sabe fazer, deixe o banco fazer."*`;

const MD_UNION = `## UNION em CDS — Combinando Múltiplas Views

### O que é?

\`UNION\` empilha os resultados de duas ou mais queries em um único resultado.

**Regras:**
- Mesmo número de campos em cada query
- Tipos de dados compatíveis nas colunas correspondentes
- \`UNION\` remove duplicatas; \`UNION ALL\` mantém todas as linhas

---

### Sintaxe na CDS

\`\`\`sql
define view ZConsolidado as
  select from ZVendasNacionais {
    Documento,
    Cliente,
    Valor
  }
union all
  select from ZVendasExportacao {
    Documento,
    Cliente,
    Valor
  }
\`\`\`

---

### Caso de uso prático

Consolidar dados de múltiplas fontes com a mesma estrutura:
- Pedidos de venda + Pedidos de transferência em uma única listagem
- Movimentos de entrada + saída em um extrato único
- Dados de múltiplas tabelas históricas em uma view unificada

---

### UNION vs JOIN

| | UNION | JOIN |
|---|---|---|
| Direção | Vertical (empilha linhas) | Horizontal (combina colunas) |
| Requisito | Mesma estrutura de colunas | Chave de relacionamento |
| Uso | Fontes com mesma estrutura | Entidades com relacionamento |`;

const MD_VIRTUAL_ELEMENTS = `## Virtual Elements — Campos Calculados por ABAP na CDS

### O que são?

Virtual Elements permitem adicionar campos em uma CDS View que **não existem nas tabelas** — são calculados por uma **classe ABAP** em tempo de execução.

---

### Anotações necessárias na CDS

\`\`\`sql
@ObjectModel.virtualElement: true
@ObjectModel.virtualElementCalculatedBy: 'ABAP:ZCL_MINHA_CLASSE'

cast( ' ' as abap.char(20) ) as StatusCalculado
\`\`\`

---

### Classe ABAP implementadora

A classe referenciada deve implementar a interface:
\`IF_SADL_EXIT_CALC_ELEMENT_READ\`

**Métodos obrigatórios:**

| Método | Função |
|---|---|
| \`GET_CALCULATION_INFO\` | Informa quais campos base precisam ser lidos |
| \`CALCULATE\` | Recebe os dados e preenche o campo virtual |

---

### Quando usar

- Lógica de derivação complexa demais para \`CASE\` na CDS
- Necessidade de chamar Function Modules ou lógica ABAP dentro da view
- Campos de status calculados por regras de negócio complexas
- Conversões que envolvem dados de outras fontes não acessíveis via SQL

---

### ⚠️ Limitações

- Virtual Elements **não são persistidos** no banco
- **Não são filtráveis** diretamente via OData (\`$filter\` não funciona)
- **Performance:** cada registro passa pelo ABAP — usar com moderação
- Não são suportados em todas as camadas do VDM`;

const MD_FIORI_ANNOTATIONS = `## Fiori Elements com Annotations — Telas Geradas por CDS

### O conceito

Com as anotações corretas na CDS View, o **Fiori Elements** gera a tela automaticamente em tempo de execução — sem precisar escrever código UI5 manual.

---

### Fluxo geral

\`\`\`
CDS View (anotações @UI) → OData Service → Fiori Elements App
\`\`\`

---

### Tipos de tela (Floorplans)

| Floorplan | Anotações principais |
|---|---|
| **List Report** | \`@UI.lineItem\` + \`@UI.selectionField\` |
| **Object Page** | \`@UI.fieldGroup\` + \`@UI.facet\` |
| **Analytical List Page** | \`@UI.chart\` + \`@UI.lineItem\` |
| **Overview Page** | \`@UI.card\` |

---

### Anotações @UI mais usadas

\`\`\`sql
-- Coluna na lista
@UI.lineItem: [ { position: 10, label: 'Pedido' } ]

-- Filtro na lista
@UI.selectionField: [ { position: 10 } ]

-- Campo em grupo na Object Page
@UI.fieldGroup: [ { qualifier: 'Cabecalho', position: 10 } ]

-- Seção (facet) na Object Page
@UI.facet: [ { type: #COLLECTION, targetQualifier: 'Cabecalho', label: 'Dados Gerais' } ]

-- Ocultar campo
@UI.hidden: true
\`\`\`

---

### UI5 Smart Controls — o melhor dos mundos

Combinam **Freestyle UI5** + **Fiori Elements**:

| Aspecto | Smart Controls |
|---|---|
| Estrutura | Você define o HTML/View XML livremente |
| Comportamento | Os controles leem as anotações CDS automaticamente |
| Exemplos | SmartTable, SmartFilterBar, SmartForm, SmartField |

**Quando usar Smart Controls:**
- O Fiori Elements puro não atende o layout desejado
- Precisa de lógica customizada na tela mas quer aproveitar as anotações
- Projetos que precisam de flexibilidade visual + padronização SAP`;

const MD_ASSOC_UPDATE = `## Associations em CDS — Carregamento por Demanda

### Conceito de Lazy Loading

As Associations em CDS são carregadas **por demanda** — os dados da entidade associada só são buscados quando o consumidor solicita explicitamente aquela associação.

Isso evita joins desnecessários em queries de listagem.

---

### Declaração na CDS

\`\`\`sql
define view ZSalesOrder as select from vbak {
  vbeln as SalesOrder,
  kunnr as Customer,

  -- Declaração da associação (não gera JOIN automático)
  _Customer.Name1 as CustomerName   -- uso via path expression
}

-- Associação declarada (carregamento por demanda)
association [0..1] to I_Customer as _Customer
  on $projection.Customer = _Customer.Customer
\`\`\`

---

### Path Expression — usando campos da associação

\`\`\`sql
-- Navegar para campo de entidade associada
_Customer.City       as CidadeCliente,
_Customer.Country    as Pais,
_Material.MatlDesc   as DescricaoMaterial
\`\`\`

> O banco só executa o JOIN quando o campo é efetivamente solicitado.

---

### Navegação via OData (\$expand)

\`\`\`
GET /SalesOrders?$expand=_Customer
\`\`\`

Retorna a ordem + dados do cliente em um único request.

Sem \`$expand\`, apenas os campos da view base são retornados.

---

### Caso de uso prático

| Cenário | Comportamento |
|---|---|
| Listar todas as ordens (sem detalhe do cliente) | Sem JOIN — só dados de \`vbak\` |
| Abrir uma ordem e ver dados do cliente | \`$expand=_Customer\` → JOIN executado |
| Navegar de material da ordem para cadastro | \`$expand=_Material\` → JOIN executado |

---

### Cardinalidade

| Notação | Significado |
|---|---|
| \`[0..1]\` | Zero ou um registro associado (TO ONE) |
| \`[0..*]\` | Zero ou muitos registros (TO MANY) |
| \`[1..1]\` | Exatamente um (obrigatório) |`;

const MD_EXTVIEW_UPDATE = `## Extension Views (E_) — Estendendo CDS Standard

### O que são?

Permitem adicionar campos customizados em CDS Views SAP Standard **sem modificar** a view original — sem modification key, sem perda de upgrade.

---

### Abordagem 1: Custom Fields and Logic (Ferramenta Fiori)

> Indicada para campos simples sem lógica complexa.

1. Acessar app **Custom Fields and Logic** no Fiori Launchpad
2. Criar um **Custom Field** (campo customizado)
3. O campo é disponibilizado automaticamente nas CDS Views habilitadas para extensão
4. Não requer programação ABAP direta

---

### Abordagem 2: EXTEND VIEW (DDL)

> Mais poderosa — permite associações e campos calculados.

\`\`\`sql
@AbapCatalog.sqlViewAppendName: 'ZAE_SALESORDER'
extend view I_SalesOrder with ZE_SalesOrder {

  -- Campos de tabela append (APPEND structure na tabela base)
  vbak.zzCampoCustomizado as CampoCustomizado,

  -- Navegação via associação existente
  _Customer.City as CidadeCliente

}
\`\`\`

---

### Comparativo

| | Custom Fields and Logic | Extend View (DDL) |
|---|---|---|
| Complexidade | Baixa — interface visual | Média — requer ABAP |
| Permite associações | Não | Sim |
| Lógica customizada | Limitada | Via ABAP ou CASE |
| Transportável | Sim (Customizing) | Sim (Workbench) |
| Recomendado para | S/4HANA Cloud | S/4HANA On-Premise |

---

### Quando usar

- Enriquecer processos standard (SD, MM, FI, HCM) com campos de negócio específicos
- Adicionar campos de tabelas Z em views SAP sem tocar no código standard
- Projetos S/4HANA Cloud onde modificações são proibidas`;

const MD_LINKS_CDS = `## Links Úteis — CDS Views e APIs SAP

### CDS Views Standard S/4HANA

Documentação oficial de todas as CDS Views disponíveis no S/4HANA Cloud:

https://help.sap.com/docs/SAP_S4HANA_CLOUD/c0c54048d35849128be8e872df5bea6d/5418de55938d1d22e10000000a44147b.html

---

### SAP API Business Hub

Catálogo de todas as APIs OData e REST disponíveis:

https://api.sap.com/

**Como usar:**
1. Filtrar por produto (ex: S/4HANA Cloud)
2. Filtrar por tipo: **OData V2** ou **OData V4**
3. Encontrar a API desejada e clicar em **Try Out** para testar no sandbox
4. Baixar o EDMX: clicar em **API Specification → EDMX**
   - Usar esse arquivo no **Model Operation** do CPI para mapear os campos

---

### Dicas de Uso

| Necessidade | Onde buscar |
|---|---|
| Encontrar CDS View standard de MM | SAP Help → filtrar por módulo |
| Testar uma API OData antes de integrar | API Business Hub → Try Out |
| Baixar EDMX para usar no CPI | API Business Hub → API Specification |
| Ver quais campos uma API expõe | API Business Hub → Schema |`;

// ─── Execução ──────────────────────────────────────────────────────────────

async function run() {
  let errors = 0;

  // ── 1. Novas áreas ─────────────────────────────────────────────────────
  const novasAreas = [
    newNode('Configuração Inicial', 'area',
      'Setup do ambiente CPI no SAP BTP Trial e criação de credenciais',
      '', ['CPI', 'Setup', 'BTP'], CPI_PASTA),

    newNode('Segurança & Credenciais', 'area',
      'Security Material, Connectivity Tests e gestão de credenciais no CPI',
      '', ['CPI', 'Segurança', 'Credentials'], CPI_PASTA),

    newNode('Ferramentas & Utilitários', 'area',
      'Ferramentas externas utilizadas no contexto de integração CPI',
      '', ['CPI', 'Ferramentas', 'SOAP'], CPI_PASTA),

    newNode('Referências & Links', 'area',
      'Links úteis para documentação CDS, APIs SAP e recursos externos',
      '', ['CDS', 'Links', 'Referências'], CDS_PASTA),
  ];

  console.log('\n⏳ Inserindo novas áreas...');
  const { data: areasData, error: areasError } = await supabase
    .from('nodes').insert(novasAreas).select();
  if (areasError) { console.error('❌ Áreas:', areasError.message); errors++; }
  else console.log(`✅ ${areasData.length} áreas criadas`);

  // IDs das áreas recém-criadas
  const areaIds = {};
  (areasData || []).forEach(a => { areaIds[a.title] = a.id; });

  const CONFIG_AREA    = areaIds['Configuração Inicial'];
  const SEG_AREA       = areaIds['Segurança & Credenciais'];
  const TOOLS_AREA     = areaIds['Ferramentas & Utilitários'];
  const REFS_AREA      = areaIds['Referências & Links'];

  // ── 2. Novos nós folha ─────────────────────────────────────────────────
  const novosNos = [
    // Configuração Inicial
    newNode('Setup do Ambiente Trial', 'cpi',
      'Passo a passo para criar e configurar o ambiente CPI no SAP BTP Trial',
      MD_SETUP_TRIAL, ['CPI', 'Setup', 'Trial', 'BTP'], CONFIG_AREA),

    newNode('Criando Client ID e Secret', 'cpi',
      'Como gerar credenciais OAuth2 (Client ID + Secret) para consumo externo de iFlows',
      MD_CLIENT_ID, ['CPI', 'OAuth2', 'ClientCredentials', 'Segurança'], CONFIG_AREA),

    // iFlows
    newNode('Versionamento e Gerenciamento de iFlows', 'cpi',
      'Versionar, renomear iFlows e renomear pacotes no CPI',
      MD_VERSIONAMENTO, ['CPI', 'iFlow', 'Versão', 'Pacote'], IFLOWS_AREA),

    newNode('Content Modifier', 'cpi',
      'Criar e manipular propriedades de mensagem com xPath e converter formatos (XML, JSON, CSV, FTP)',
      MD_CONTENT_MODIFIER, ['CPI', 'ContentModifier', 'XPath', 'Converter'], IFLOWS_AREA),

    newNode('Request Reply', 'cpi',
      'Padrão de integração síncrono — envia mensagem e aguarda resposta (EIP)',
      MD_REQUEST_REPLY, ['CPI', 'RequestReply', 'EIP', 'Síncrono'], IFLOWS_AREA),

    // Segurança & Credenciais
    newNode('Security Material', 'cpi',
      'Gerenciamento de credenciais, senhas e certificados no CPI',
      MD_SECURITY_MATERIAL, ['CPI', 'Segurança', 'Credenciais', 'Certificado'], SEG_AREA),

    newNode('Connectivity Tests', 'cpi',
      'Testar conectividade de adaptadores e gerar certificados no CPI',
      MD_CONNECTIVITY_TESTS, ['CPI', 'Conectividade', 'Teste', 'FTP', 'SMTP'], SEG_AREA),

    // Ferramentas
    newNode('SOAP UI', 'cpi',
      'Ferramenta desktop para testar Web Services SOAP e APIs',
      MD_SOAP_UI, ['CPI', 'SOAPUI', 'Teste', 'WebService'], TOOLS_AREA),

    // CDS — Estrutura de Código
    newNode('Code Pushdown', 'desenvolvimento',
      'Princípio de mover processamento do servidor ABAP para o banco HANA via CDS',
      MD_CODE_PUSHDOWN, ['CDS', 'HANA', 'Performance', 'CodePushdown'], ESTRUTURA_AREA),

    newNode('UNION em CDS', 'desenvolvimento',
      'Combinar resultados de múltiplas CDS Views em um único conjunto de dados',
      MD_UNION, ['CDS', 'UNION', 'SQL'], ESTRUTURA_AREA),

    // CDS — Annotations
    newNode('Virtual Elements', 'desenvolvimento',
      'Campos calculados por classe ABAP dentro de uma CDS View via anotações',
      MD_VIRTUAL_ELEMENTS, ['CDS', 'VirtualElement', 'ABAP', 'Annotation'], ANNOTATIONS_AREA),

    newNode('Fiori Elements com Annotations', 'desenvolvimento',
      'Criar telas Fiori Elements em tempo de execução via anotações CDS e UI5 Smart Controls',
      MD_FIORI_ANNOTATIONS, ['CDS', 'Fiori', 'FioriElements', 'SmartControls', 'UI5'], ANNOTATIONS_AREA),

    // CDS — Referências
    newNode('Links Úteis CDS', 'desenvolvimento',
      'Links para documentação CDS Standard, SAP API Business Hub e recursos externos',
      MD_LINKS_CDS, ['CDS', 'Links', 'APIHub', 'Referências'], REFS_AREA),
  ];

  console.log('\n⏳ Inserindo novos nós...');
  const { data: nosData, error: nosError } = await supabase
    .from('nodes').insert(novosNos).select();
  if (nosError) { console.error('❌ Nós:', nosError.message); errors++; }
  else console.log(`✅ ${nosData.length} nós criados`);

  // ── 3. Atualizar nós existentes com conteúdo ───────────────────────────
  const updates = [
    { id: MAIL_NODE,    content: MD_MAIL_ADAPTER,   description: 'Envio de emails via SMTP, configuração de canal Mail e Security Material' },
    { id: ODATA_NODE,   content: MD_ODATA_ADAPTER,  description: 'OData receiver via Request Reply, CRUD, mapeamento de campos e content-type' },
    { id: CAST_NODE,    content: MD_CAST_UPDATE,    description: 'CASE, CAST e COALESCE — expressões condicionais e conversão de tipos em CDS' },
    { id: ASSOC_NODE,   content: MD_ASSOC_UPDATE,   description: 'Associations TO ONE/TO MANY, lazy loading, path expressions e $expand no OData' },
    { id: EXTVIEW_NODE, content: MD_EXTVIEW_UPDATE, description: 'Extensão de CDS Standard via Custom Fields and Logic ou EXTEND VIEW DDL' },
  ];

  console.log('\n⏳ Atualizando nós existentes...');
  for (const u of updates) {
    const { error } = await supabase.from('nodes')
      .update({ content: u.content, description: u.description, updated_at: now() })
      .eq('id', u.id);
    if (error) { console.error(`❌ Update ${u.id}:`, error.message); errors++; }
    else console.log(`✅ Atualizado: ${u.id}`);
  }

  // ── Resultado final ────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  if (errors === 0) console.log('🎉 Tudo inserido com sucesso!');
  else console.log(`⚠️  Concluído com ${errors} erro(s).`);
}

run().catch(console.error);
