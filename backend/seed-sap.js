const http = require('http');

const BASE = 'http://localhost:3001';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: 'localhost', port: 3001, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = http.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        const json = JSON.parse(buf);
        if (res.statusCode >= 400) reject(new Error(json.error || buf));
        else resolve(json);
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function n(title, type, description, tags, parentId) {
  const node = await post('/api/nodes', {
    title, type, description: description || '', tags: tags || [], parent_id: parentId || null
  });
  console.log(`  ✓ ${title}`);
  return node.id;
}

async function seed() {
  console.log('\n=== SAP Knowledge Base ===\n');

  // ─── ABAP CLÁSSICO ────────────────────────────────────────────────────────
  console.log('📁 ABAP Clássico (ECC)');
  const abapEcc = await n('ABAP Clássico (ECC)', 'pasta', 'Desenvolvimento ABAP para sistemas ECC', ['ABAP','ECC']);
  const fundamentos = await n('Fundamentos ABAP', 'area', 'Conceitos base da linguagem ABAP', ['ABAP'], abapEcc);
  await n('Sintaxe Básica', 'desenvolvimento', 'Comandos e estrutura básica do ABAP', ['ABAP','Sintaxe'], fundamentos);
  await n('Tipos de Dados & Variáveis', 'desenvolvimento', 'DATA, TYPES, CONSTANTS, FIELD-SYMBOLS', ['ABAP','Tipos'], fundamentos);
  await n('Internal Tables', 'desenvolvimento', 'STANDARD, SORTED, HASHED TABLE – operações LOOP, READ, MODIFY, DELETE', ['ABAP','Internal Tables'], fundamentos);
  await n('Modularização (FORM / FM)', 'desenvolvimento', 'PERFORM, FUNCTION, CALL FUNCTION, parâmetros IMPORTING/EXPORTING/TABLES/CHANGING', ['ABAP','Modularização'], fundamentos);
  await n('String Operations', 'desenvolvimento', 'CONCATENATE, SPLIT, CONDENSE, REPLACE, FIND, regex', ['ABAP','String'], fundamentos);

  const reports = await n('Reports & ALV', 'area', 'Relatórios clássicos e ALV', ['ABAP','Report','ALV'], abapEcc);
  await n('Report Clássico (WRITE)', 'desenvolvimento', 'WRITE, FORMAT, ULINE, TOP-OF-PAGE, END-OF-PAGE', ['ABAP','Report'], reports);
  await n('ALV Grid (CL_GUI_ALV_GRID)', 'desenvolvimento', 'CL_GUI_ALV_GRID – fieldcat, layout, events, edit mode', ['ABAP','ALV'], reports);
  await n('ALV com REUSE_ALV_GRID_DISPLAY', 'desenvolvimento', 'FM clássico de ALV, fieldcat builder, variantes de layout', ['ABAP','ALV'], reports);
  await n('ALV Tree & Hierarquia', 'desenvolvimento', 'CL_GUI_ALV_TREE para exibições hierárquicas', ['ABAP','ALV'], reports);

  const oop = await n('OOP ABAP', 'area', 'Programação Orientada a Objetos em ABAP', ['ABAP','OOP'], abapEcc);
  await n('Classes & Interfaces', 'desenvolvimento', 'CLASS, INTERFACE, METHODS, ATTRIBUTES, ALIASES', ['ABAP','OOP'], oop);
  await n('Herança & Polimorfismo', 'desenvolvimento', 'INHERITING FROM, SUPER->, REDEFINITION, casting', ['ABAP','OOP'], oop);
  await n('Exceções (CX_)', 'desenvolvimento', 'TRY/CATCH/CLEANUP, classes CX_, RAISE EXCEPTION', ['ABAP','OOP','Exceções'], oop);
  await n('Design Patterns em ABAP', 'desenvolvimento', 'Singleton, Factory, Observer, Strategy, Template Method', ['ABAP','OOP','Design Patterns'], oop);

  const enh = await n('Enhancements Framework', 'area', 'Pontos de saída e extensão de programas SAP', ['ABAP','Enhancement'], abapEcc);
  await n('User Exits (SMOD/CMOD)', 'desenvolvimento', 'Customer exits clássicos via SMOD/CMOD', ['ABAP','UserExit'], enh);
  await n('BAdIs (Business Add-Ins)', 'desenvolvimento', 'BAdIs clássicas e novas (kernel BAdI), GET_INSTANCE', ['ABAP','BAdI'], enh);
  await n('Enhancement Spots & Sections', 'desenvolvimento', 'Implicit/Explicit enhancements, ENHANCEMENT-POINT', ['ABAP','Enhancement'], enh);
  await n('Substitutions & Validations', 'desenvolvimento', 'Substituições e validações FI via GGB0/GGB1', ['ABAP','FI','Validation'], enh);

  const forms = await n('Forms & Output', 'area', 'Formulários e saída de documentos', ['ABAP','Forms'], abapEcc);
  await n('Smart Forms', 'desenvolvimento', 'SSF_FUNCTION_MODULE_NAME, SFPSY, driver programs', ['ABAP','SmartForms'], forms);
  await n('Adobe Forms (FP)', 'desenvolvimento', 'FP_JOB_OPEN/CLOSE, interface ADS, PDF interativo', ['ABAP','AdobeForms'], forms);
  await n('SAPscript', 'desenvolvimento', 'Formulários legados SAPscript, OPEN_FORM/CLOSE_FORM', ['ABAP','SAPscript'], forms);

  const rfcBapi = await n('RFC & BAPIs', 'area', 'Chamadas remotas e Business APIs', ['ABAP','RFC','BAPI'], abapEcc);
  await n('Tipos de RFC (sRFC, aRFC, bgRFC, tRFC)', 'desenvolvimento', 'Diferenças entre os tipos de RFC e quando usar cada um', ['RFC'], rfcBapi);
  await n('BAPIs Standard', 'desenvolvimento', 'BAPI_SALESORDER_*, BAPI_GOODSMVT_*, busca no BAPI Explorer', ['BAPI'], rfcBapi);
  await n('Criação de Function Modules RFC-Enabled', 'desenvolvimento', 'Atributos RFC em FM, PASS BY VALUE obrigatório', ['RFC','ABAP'], rfcBapi);
  await n('Destinos RFC (SM59)', 'transacao', 'Configuração de RFC destinations, teste de conexão', ['RFC','SM59'], rfcBapi);

  // ─── ABAP S/4HANA ─────────────────────────────────────────────────────────
  console.log('\n📁 ABAP S/4HANA');
  const abapS4 = await n('ABAP S/4HANA', 'pasta', 'ABAP moderno para S/4HANA', ['ABAP','S4HANA']);

  const novaSintaxe = await n('Nova Sintaxe ABAP', 'area', 'Construções da nova sintaxe ABAP 7.4+', ['ABAP','S4HANA','Sintaxe'], abapS4);
  await n('Inline Declarations (DATA / FIELD-SYMBOLS)', 'desenvolvimento', 'DATA(...), FIELD-SYMBOL(...), FINAL – declarações inline', ['ABAP','S4HANA'], novaSintaxe);
  await n('String Templates & Operadores Funcionais', 'desenvolvimento', '|...|, COND, SWITCH, REDUCE, FILTER, FOR, VALUE, NEW', ['ABAP','S4HANA'], novaSintaxe);
  await n('ABAP SQL (SELECT aprimorado)', 'desenvolvimento', 'SELECT com expressions, subqueries, CTE (WITH), GROUP BY com GROUPING SETS', ['ABAP','S4HANA','SQL'], novaSintaxe);
  await n('Mesh & Constructor Expressions', 'desenvolvimento', 'CORRESPONDING, BASE, EXACT, CAST, REF – operadores de construção', ['ABAP','S4HANA'], novaSintaxe);

  const rap = await n('RAP – RESTful App Programming', 'area', 'Modelo de programação RAP para S/4HANA e BTP', ['ABAP','RAP','S4HANA'], abapS4);
  await n('Business Objects (BO)', 'desenvolvimento', 'Estrutura de um BO: root entity, compositions, associations', ['RAP','S4HANA'], rap);
  await n('Behavior Definition (BDEF)', 'desenvolvimento', 'managed/unmanaged, create/update/delete, actions, functions, determinations, validations', ['RAP','BDEF'], rap);
  await n('Behavior Implementation (ABAP Class)', 'desenvolvimento', 'FOR MODIFY, FOR VALIDATE, FOR DETERMINE, FOR ACTION, side effects', ['RAP','ABAP'], rap);
  await n('Service Definition & Binding', 'desenvolvimento', 'SRVD, SRVB, OData V2/V4 exposure', ['RAP','OData','S4HANA'], rap);
  await n('Draft Handling', 'desenvolvimento', 'Draft enable, ETAG, lock mechanism, activate/discard', ['RAP','S4HANA','Draft'], rap);

  const aUnit = await n('ABAP Unit Test', 'area', 'Testes unitários em ABAP', ['ABAP','Test'], abapS4);
  await n('Estrutura de Test Class', 'desenvolvimento', 'FOR TESTING, RISK LEVEL, DURATION, setup/teardown methods', ['ABAP','UnitTest'], aUnit);
  await n('Test Doubles & Mocks', 'desenvolvimento', 'Test seam, CL_ABAP_TESTDOUBLE, IF_OSQL_TEST_ENVIRONMENT', ['ABAP','UnitTest','Mock'], aUnit);
  await n('Code Coverage & ATC', 'desenvolvimento', 'ABAP Test Cockpit, ATC checks, findings, priorização', ['ABAP','ATC','Coverage'], aUnit);

  const adt = await n('ABAP Git & ADT', 'area', 'Ferramentas de desenvolvimento moderno', ['ABAP','Git','ADT'], abapS4);
  await n('Configuração Eclipse ADT', 'desenvolvimento', 'Instalação, conexão ao sistema, atalhos úteis, plugins recomendados', ['ADT','Eclipse'], adt);
  await n('abapGit – Repositórios', 'desenvolvimento', 'Criar/linkar repositório, pull, push, branches, conflitos', ['abapGit','Git'], adt);
  await n('ABAP Cleaner & Pretty Printer', 'desenvolvimento', 'Code cleanup rules, formatação automática via ABAP Cleaner plugin ADT', ['ABAP','ADT'], adt);

  // ─── CDS VIEWS ────────────────────────────────────────────────────────────
  console.log('\n📁 CDS Views');
  const cds = await n('CDS Views', 'pasta', 'Core Data Services – modelagem de dados ABAP', ['CDS','ABAP','S4HANA']);

  const cdsEstr = await n('Estrutura de Código', 'area', 'Sintaxe e estrutura das CDS Views', ['CDS','Sintaxe'], cds);
  await n('DDL Source (DDLS)', 'desenvolvimento', '@AbapCatalog.sqlViewName, DEFINE VIEW, AS SELECT FROM', ['CDS','DDL'], cdsEstr);
  await n('View Entities (S4HANA 2020+)', 'desenvolvimento', 'DEFINE VIEW ENTITY – sem sqlViewName, novo padrão RAP', ['CDS','ViewEntity','S4HANA'], cdsEstr);
  await n('Projection Views', 'desenvolvimento', 'DEFINE ROOT VIEW ENTITY com PROJECTION, redirecionamento de associações', ['CDS','RAP','Projection'], cdsEstr);
  await n('Parameters em CDS', 'desenvolvimento', 'WITH PARAMETERS, $parameters, tipos ABAP em parâmetros', ['CDS','Parameters'], cdsEstr);
  await n('CASE / CAST / COALESCE', 'desenvolvimento', 'Expressões condicionais e de tipo dentro de CDS', ['CDS','Expressões'], cdsEstr);

  const ann = await n('Annotations', 'area', 'Anotações CDS para diversas finalidades', ['CDS','Annotations'], cds);
  await n('@AbapCatalog', 'desenvolvimento', 'sqlViewName, viewEnhancementCategory, compiler.compareFilter, buffering', ['CDS','@AbapCatalog'], ann);
  await n('@Analytics', 'desenvolvimento', '@Analytics.dataCategory, @Analytics.query – Embedded Analytics', ['CDS','@Analytics','Analytics'], ann);
  await n('@OData.publish & @OData.entityType', 'desenvolvimento', 'Exposição automática OData V2, entityType, entitySet', ['CDS','@OData','OData'], ann);
  await n('@Search', 'desenvolvimento', '@Search.searchable, @Search.defaultSearchElement, @Search.fuzzinessThreshold', ['CDS','@Search','Fiori'], ann);
  await n('@UI (Fiori Elements)', 'desenvolvimento', '@UI.lineItem, @UI.fieldGroup, @UI.selectionField, @UI.chart, @UI.headerInfo – layout Fiori', ['CDS','@UI','Fiori'], ann);
  await n('@AccessControl.authorizationCheck', 'desenvolvimento', '#CHECK, #NOT_REQUIRED, #NOT_ALLOWED – controle de autorização', ['CDS','@AccessControl','Auth'], ann);
  await n('@Semantics', 'desenvolvimento', '@Semantics.amount.currencyCode, @Semantics.quantity.unitOfMeasure, @Semantics.text', ['CDS','@Semantics'], ann);
  await n('@Consumption', 'desenvolvimento', '@Consumption.valueHelpDefinition, @Consumption.filter, @Consumption.sort', ['CDS','@Consumption','Fiori'], ann);

  const assoc = await n('Associações & Joins', 'area', 'Relacionamentos entre entidades CDS', ['CDS','Associações'], cds);
  await n('Associations (TO ONE / TO MANY)', 'desenvolvimento', 'ASSOCIATION [0..1] TO / [0..*] TO, ON condition, REDIRECTED TO', ['CDS','Associations'], assoc);
  await n('Compositions (RAP)', 'desenvolvimento', 'COMPOSITION OF – hierarquia pai/filho em Business Objects', ['CDS','RAP','Composition'], assoc);
  await n('JOIN Types (INNER / LEFT OUTER)', 'desenvolvimento', 'JOIN, LEFT OUTER JOIN, diferença entre filtros ON vs WHERE', ['CDS','JOIN'], assoc);
  await n('PATH Expressions', 'desenvolvimento', 'Navegação por associações no SELECT, _Association.field', ['CDS','PATH'], assoc);

  const vdm = await n('VDM (Virtual Data Model)', 'area', 'Camadas de modelagem VDM S/4HANA', ['CDS','VDM','S4HANA'], cds);
  await n('Interface Views (I_)', 'desenvolvimento', 'Camada de dados brutos, prefixo I_, sem restrições de negócio', ['CDS','VDM','I_'], vdm);
  await n('Consumption Views (C_)', 'desenvolvimento', 'Camada de consumo com UI annotations, prefixo C_', ['CDS','VDM','C_'], vdm);
  await n('Extension Views (E_)', 'desenvolvimento', 'Extensões de cliente sobre views SAP standard, prefixo E_', ['CDS','VDM','Extension'], vdm);
  await n('Naming Conventions VDM', 'desenvolvimento', 'Regras de nomenclatura: I_, C_, E_, A_, P_ e suas camadas', ['CDS','VDM'], vdm);

  const dcl = await n('Access Control (DCL)', 'area', 'Controle de acesso a CDS Views via PFCG/DCL', ['CDS','DCL','Auth','Security'], cds);
  await n('DEFINE ROLE', 'desenvolvimento', 'DEFINE ROLE, GRANT SELECT ON, condições WHERE por campo de autorização', ['CDS','DCL','Auth'], dcl);
  await n('Inheritance em DCL', 'desenvolvimento', '@MandatoryAuthorizationCheck, herança de roles entre views', ['CDS','DCL','Auth'], dcl);
  await n('Integração com PFCG', 'desenvolvimento', 'Criar objetos de autorização, campos auth em CDS, teste via SU53', ['CDS','Auth','PFCG'], dcl);

  const cdsPerf = await n('Performance CDS', 'area', 'Análise e otimização de CDS Views', ['CDS','Performance','S4HANA'], cds);
  await n('EXPLAIN PLAN no ADT', 'desenvolvimento', 'PlanViz no ADT, análise de execution plan, index usage', ['CDS','Performance','ADT'], cdsPerf);
  await n('Buffering de CDS Views', 'desenvolvimento', '@AbapCatalog.buffering.status, tipos: #SINGLE, #GENERIC, #FULL', ['CDS','Performance','Buffer'], cdsPerf);
  await n('CDS Table Functions (AMDP)', 'desenvolvimento', 'DEFINE TABLE FUNCTION, AMDP implementation, casos de uso', ['CDS','AMDP','Performance'], cdsPerf);

  // ─── FIORI / UI5 ──────────────────────────────────────────────────────────
  console.log('\n📁 Fiori / UI5');
  const fiori = await n('Fiori / UI5', 'pasta', 'Desenvolvimento e configuração de apps SAP Fiori e SAPUI5', ['Fiori','UI5']);

  const fe = await n('Fiori Elements', 'area', 'Apps baseados em anotações CDS/OData', ['Fiori','FioriElements'], fiori);
  await n('List Report', 'fiori', 'Template com @UI.selectionField, @UI.lineItem, filtros e tabela', ['Fiori','ListReport'], fe);
  await n('Object Page', 'fiori', 'Object Page com @UI.fieldGroup, @UI.facet, sections e subsections', ['Fiori','ObjectPage'], fe);
  await n('Analytical List Page (ALP)', 'fiori', 'ALP com @UI.chart, @UI.presentationVariant, indicadores visuais', ['Fiori','ALP','Analytics'], fe);
  await n('Overview Page (OVP)', 'fiori', 'Cards de dados heterogêneos, @UI.identification, @UI.dataPoint', ['Fiori','OVP'], fe);

  const freestyle = await n('Freestyle SAPUI5', 'area', 'Desenvolvimento customizado com SAPUI5', ['Fiori','UI5','Freestyle'], fiori);
  await n('MVC – Controller', 'fiori', 'onInit, onBeforeRendering, onAfterRendering, onExit, lifecycle', ['UI5','MVC','Controller'], freestyle);
  await n('MVC – View (XML)', 'fiori', 'XMLView, fragments, binding syntax {path}, aggregation binding', ['UI5','MVC','View','XML'], freestyle);
  await n('Models (JSON / OData)', 'fiori', 'JSONModel, ODataModel V2/V4, two-way binding, setProperty', ['UI5','Model','OData'], freestyle);
  await n('Routing & Navigation', 'fiori', 'manifest.json routing, Router, NavContainer, hash-based navigation', ['UI5','Routing'], freestyle);
  await n('Fragments & Dialogs', 'fiori', 'sap.m.Dialog, Fragment.load, reusable fragments, popover', ['UI5','Fragment','Dialog'], freestyle);

  const odata = await n('OData Services', 'area', 'Criação e consumo de serviços OData no SAP', ['OData','Fiori','S4HANA'], fiori);
  await n('OData V2 – SAP Gateway (SEGW)', 'desenvolvimento', 'SEGW project, entity types, associations, CRUD methods, IWBEP', ['OData','V2','SEGW','Gateway'], odata);
  await n('OData V4 – via RAP', 'desenvolvimento', 'Service binding OData V4, draft, actions, functions, $batch', ['OData','V4','RAP'], odata);
  await n('Query Options ($filter, $expand, $select)', 'desenvolvimento', '$filter, $expand, $select, $top, $skip, $orderby – client-side options', ['OData','Query'], odata);

  const lp = await n('Launchpad & Configuração', 'area', 'Configuração do SAP Fiori Launchpad', ['Fiori','Launchpad'], fiori);
  await n('Tiles & Target Mappings', 'fiori', 'Criar tiles, semantic objects, intent-based navigation', ['Fiori','Tile','Launchpad'], lp);
  await n('Grupos & Catálogos (PFCG)', 'fiori', 'Associar roles a grupos e catálogos, atribuição a usuários', ['Fiori','PFCG','Launchpad'], lp);
  await n('UI Adaptation Editor (Key User)', 'fiori', 'SAPUI5 flexibility, esconder campos, criar variantes, key user tools', ['Fiori','KeyUser','Flexibility'], lp);

  // ─── BTP ──────────────────────────────────────────────────────────────────
  console.log('\n📁 BTP');
  const btp = await n('BTP (Business Technology Platform)', 'pasta', 'Plataforma de cloud SAP para extensões e integrações', ['BTP','Cloud']);

  const cf = await n('Cloud Foundry', 'area', 'Runtime Cloud Foundry no BTP', ['BTP','CF','Cloud'], btp);
  await n('Subaccounts & Spaces', 'btp', 'Estrutura: global account → subaccount → space, entitlements', ['BTP','CF'], cf);
  await n('Buildpacks & Deploy (cf push)', 'btp', 'cf push, manifest.yml, memory/disk quota, health checks', ['BTP','CF','Deploy'], cf);
  await n('Serviços CF (Service Marketplace)', 'btp', 'cf create-service, bind-service, VCAP_SERVICES, service keys', ['BTP','CF','Services'], cf);
  await n('Destination Service', 'btp', 'Destinations, ProxyType OnPremise/Internet, Principal Propagation', ['BTP','Destination','Connectivity'], cf);
  await n('Connectivity & Cloud Connector (SCC)', 'btp', 'SAP Cloud Connector, acesso a sistemas on-premise via SCC', ['BTP','SCC','Connectivity'], cf);

  const hanaCloud = await n('SAP HANA Cloud', 'area', 'Banco HANA como serviço no BTP', ['BTP','HANA','Database'], btp);
  await n('HDI Containers & CAP', 'btp', 'SAP CAP (Node.js/Java), CDS, HDI deployment, schema versioning', ['BTP','HANA','CAP','HDI'], hanaCloud);
  await n('Calculation Views', 'btp', 'Graphical calculation views, joins, unions, aggregation nodes', ['HANA','CalcViews','Analytics'], hanaCloud);
  await n('SQL Script & AMDP', 'btp', 'SQLScript procedures, AMDP no ABAP, CE functions, error handling', ['HANA','SQLScript','AMDP'], hanaCloud);

  const sapBuild = await n('SAP Build', 'area', 'Suite low-code SAP Build', ['BTP','Build','LowCode'], btp);
  await n('Build Apps (AppGyver)', 'btp', 'Criação de apps mobile/web sem código, data resources, logic flows', ['Build','AppGyver','LowCode'], sapBuild);
  await n('Build Process Automation (SPA)', 'btp', 'RPA bots, workflows, BPMN, forms, automation projects', ['Build','SPA','RPA','Workflow'], sapBuild);
  await n('Build Work Zone', 'btp', 'Portal de colaboração, Business Sites, integração com Fiori Launchpad', ['Build','WorkZone','Portal'], sapBuild);
  await n('SAP Build Code', 'btp', 'Joule AI coding, RAP geração assistida, CAP + SAP Build Code', ['Build','AI','RAP','CAP'], sapBuild);

  const ext = await n('Side-by-Side Extensions', 'area', 'Extensões SAP sem modificações no core', ['BTP','Extension','S4HANA'], btp);
  await n('Clean Core & Extensibility Concept', 'btp', 'In-app vs side-by-side, clean core, extensibility explorer', ['BTP','Extension','CleanCore'], ext);
  await n('Event Mesh (SAP Event Broker)', 'btp', 'Publish/Subscribe, Business Events, Eventing em S/4HANA', ['BTP','EventMesh','Events'], ext);

  // ─── CPI ──────────────────────────────────────────────────────────────────
  console.log('\n📁 CPI (Cloud Integration)');
  const cpi = await n('CPI (Cloud Integration)', 'pasta', 'SAP Integration Suite – Cloud Platform Integration', ['CPI','CIG','Integration']);

  const iflows = await n('iFlows', 'area', 'Fluxos de integração no CPI', ['CPI','iFlow'], cpi);
  await n('Estrutura de um iFlow', 'cpi', 'Sender → Channel → Process → Receiver, message pipeline', ['CPI','iFlow'], iflows);
  await n('Message Structure (Header / Body / Attachment)', 'cpi', 'CamelHttpUri, SAP_ApplicationID, body como InputStream', ['CPI','Message'], iflows);
  await n('Padrões de Integração (EIP)', 'cpi', 'Content-Based Router, Splitter, Aggregator, Message Filter, Enricher', ['CPI','EIP','Pattern'], iflows);
  await n('Error Handling & Dead Letter', 'cpi', 'Exception subprocess, escalation, retry, send step on error', ['CPI','ErrorHandling'], iflows);
  await n('Externalizing Parameters', 'cpi', 'Configure-only, externalized params, Partner Directory', ['CPI','Parameters'], iflows);

  const adapters = await n('Adapters & Channels', 'area', 'Conectores de entrada e saída no CPI', ['CPI','Adapter'], cpi);
  await n('HTTP & SOAP Adapter', 'cpi', 'HTTP sender/receiver, SOAP sender/receiver, WS-Security, MTOM', ['CPI','Adapter','HTTP','SOAP'], adapters);
  await n('SFTP & FTP Adapter', 'cpi', 'Polling SFTP, push de arquivos, expressões de nome de arquivo, PGP', ['CPI','Adapter','SFTP','FTP'], adapters);
  await n('IDoc & RFC Adapter', 'cpi', 'IDoc sender/receiver, RFC receiver, JCo, middleware SAP', ['CPI','Adapter','IDoc','RFC'], adapters);
  await n('OData & REST Adapter', 'cpi', 'OData receiver com CRUD, REST adapter, JSON/XML handling', ['CPI','Adapter','OData','REST'], adapters);
  await n('AMQP & Kafka Adapter', 'cpi', 'Mensageria assíncrona, Event Mesh integration, topics e subscriptions', ['CPI','Adapter','AMQP','Kafka'], adapters);
  await n('Mail Adapter', 'cpi', 'Envio de emails via SMTP, attachments, templates HTML', ['CPI','Adapter','Mail'], adapters);

  const groovy = await n('Groovy Scripts', 'area', 'Scripting Groovy para processamento de mensagens', ['CPI','Groovy','Script'], cpi);
  await n('Message API (def processData)', 'cpi', 'def Message processData(Message msg) – estrutura padrão de script CPI', ['CPI','Groovy','MessageAPI'], groovy);
  await n('Manipulação de Headers & Properties', 'cpi', 'msg.getHeaders(), setHeader(), getProperty(), setProperty()', ['CPI','Groovy','Headers'], groovy);
  await n('Parsing XML & JSON no Groovy', 'cpi', 'XmlSlurper, JsonSlurper, manipulação de payload, conversão', ['CPI','Groovy','XML','JSON'], groovy);
  await n('Logging & Trace no Script', 'cpi', 'messageLogFactory.getMessageLog(message), addAttachmentAsString()', ['CPI','Groovy','Log'], groovy);

  const mapping = await n('Message Mapping', 'area', 'Transformação e mapeamento de mensagens', ['CPI','Mapping'], cpi);
  await n('Graphical Message Mapping', 'cpi', 'Mapeamento drag-and-drop, funções standard, user-defined functions', ['CPI','Mapping','Graphical'], mapping);
  await n('XSLT Mapping', 'cpi', 'Transformações XSL, XSLT 2.0, templates, variáveis, extensões SAP', ['CPI','Mapping','XSLT'], mapping);
  await n('JSON-to-JSON & JSON-to-XML', 'cpi', 'Json Converter, XML-JSON conversão bidirecional, estrutura payload', ['CPI','Mapping','JSON'], mapping);

  const apiMgmt = await n('API Management', 'area', 'Gestão de APIs no SAP Integration Suite', ['CPI','API','APIManagement'], cpi);
  await n('API Proxies & Products', 'cpi', 'Criação de proxy, API products, developer portal, subscriptions', ['API','APIProxy'], apiMgmt);
  await n('Policies (Quota, Spike Arrest, OAuth)', 'cpi', 'Rate limiting, spike arrest, OAuth 2.0, JWT verify, cache policy', ['API','Policy','Security'], apiMgmt);
  await n('Monitoramento & Analytics de API', 'cpi', 'Dashboard de uso, error analysis, latency, traffic reports', ['API','Monitor'], apiMgmt);

  const cpiMon = await n('Monitoramento CPI', 'area', 'Monitoramento e operação de integrações', ['CPI','Monitor','Ops'], cpi);
  await n('Message Monitor (MPL)', 'cpi', 'MPL – Message Processing Log, status COMPLETED/FAILED/RETRY', ['CPI','Monitor','MPL'], cpiMon);
  await n('Alertas & Notificações', 'cpi', 'Alert rules, email notification, OpsAlert categories, SAP Cloud ALM', ['CPI','Alert','ALM'], cpiMon);
  await n('Pacotes & Versioning', 'cpi', 'Integration packages, transport, versão draft/active, migration', ['CPI','Package','Version'], cpiMon);

  // ─── INTEGRAÇÕES ──────────────────────────────────────────────────────────
  console.log('\n📁 Integrações');
  const integracoes = await n('Integrações', 'pasta', 'Padrões e tecnologias de integração SAP', ['Integração','SAP','Interface']);

  const idocs = await n('IDocs', 'area', 'Intermediate Documents – troca de dados SAP', ['IDoc','ALE','EDI'], integracoes);
  await n('Estrutura de IDoc (Segmentos)', 'integracao', 'Control Record (EDI_DC40), Data Record (EDI_DD40), Status Record', ['IDoc','Estrutura'], idocs);
  await n('Message Types & Basic Types', 'integracao', 'Message type (ORDERS), Basic type (ORDERS05), Extension Types', ['IDoc','MessageType'], idocs);
  await n('Partner Profiles (WE20)', 'transacao', 'Configuração de parceiros, port de saída, inbound/outbound parameters', ['IDoc','WE20','Config'], idocs);
  await n('ALE – Application Link Enabling', 'integracao', 'BAPI IDOCs, modelo de distribuição (BD64), RFC destinations', ['IDoc','ALE','BD64'], idocs);
  await n('EDI – Troca de dados externa', 'integracao', 'IDocs com parceiros externos via conversor EDI, EDIFACT/X12', ['IDoc','EDI'], idocs);
  await n('Reprocessamento & Status (BD87)', 'transacao', 'Status codes IDoc, reprocessamento, WE02/WE05/BD87', ['IDoc','BD87','Monitor'], idocs);

  const ws = await n('Web Services & SOAP', 'area', 'Integração via protocolos SOAP e Web Services', ['SOAP','WebService','WSDL'], integracoes);
  await n('WSDL & Proxy Generation', 'integracao', 'SOAMANAGER, geração de proxy ABAP a partir de WSDL (SE80)', ['SOAP','WSDL','Proxy'], ws);
  await n('Publicando Web Services no SAP', 'integracao', 'Criar enterprise service, ativação em SOAMANAGER, WSADMIN', ['SOAP','WebService','SOAMANAGER'], ws);
  await n('WS-Security (SSL / OAuth)', 'integracao', 'Certificados SSL, binding de segurança, user token, X.509', ['SOAP','Security','SSL'], ws);

  const restApi = await n('REST APIs', 'area', 'Consumo e exposição de APIs REST no SAP', ['REST','API','JSON'], integracoes);
  await n('SAP API Business Hub', 'integracao', 'Descoberta de APIs SAP, sandbox, Business Accelerator Hub', ['REST','API','Hub'], restApi);
  await n('Consumo REST via ABAP (cl_http_client)', 'desenvolvimento', 'cl_http_client=>create_by_destination, request/response, JSON parsing', ['REST','ABAP','HTTP'], restApi);
  await n('Criação de APIs REST (Gateway / RAP)', 'desenvolvimento', 'Exposição de APIs via SAP Gateway (SEGW) ou RAP OData V4', ['REST','API','Gateway','RAP'], restApi);

  // ─── PROCESSOS FUNCIONAIS ─────────────────────────────────────────────────
  console.log('\n📁 Processos Funcionais');
  const funcional = await n('Processos Funcionais', 'pasta', 'Processos de negócio SAP por módulo', ['Funcional','SAP','ECC','S4HANA']);

  const sd = await n('SD – Sales & Distribution', 'modulo', 'Vendas e distribuição SAP', ['SD','Funcional'], funcional);
  await n('Ciclo Order-to-Cash', 'processo', 'Cotação → Pedido → Entrega → Faturamento → Recebimento', ['SD','OTC'], sd);
  await n('Dados Mestre SD', 'processo', 'Cliente (KNA1), Material, Info de Vendas, Preços, Condições', ['SD','MasterData'], sd);
  await n('Precificação & Condições (VK11)', 'processo', 'Procedure de precificação, condition types, tabelas de condição', ['SD','Pricing','VK11'], sd);
  await n('Faturamento & NF-e (VF01)', 'processo', 'Tipos de fatura, billing docs, integração FI, nota fiscal Brasil', ['SD','Billing','VF01'], sd);
  await n('Crédito & Bloqueio de Cliente', 'processo', 'Limite de crédito, SD01, bloqueio de pedido, liberação VKM1', ['SD','Credit'], sd);

  const mm = await n('MM – Materials Management', 'modulo', 'Gestão de materiais e compras', ['MM','Funcional'], funcional);
  await n('Ciclo Procure-to-Pay', 'processo', 'Requisição → Pedido de Compra → Recebimento → Fatura → Pagamento', ['MM','PTP'], mm);
  await n('Dados Mestre MM', 'processo', 'Material (MARA/MAKT), Fornecedor (LFA1), Inforegistro (EINA)', ['MM','MasterData'], mm);
  await n('MRP – Planejamento de Necessidades', 'processo', 'Tipos de MRP, MD01/MD02, livro MRP, parâmetros de planejamento', ['MM','MRP','MD01'], mm);
  await n('Movimentos de Estoque (MIGO)', 'transacao', '101 GR, 201 GI, 311 Transfer, 551 Scrap – tipos de movimento MIGO', ['MM','MIGO','Estoque'], mm);
  await n('Avaliação de Estoque & Fechamento', 'processo', 'Standard price, MAP, desvios de preço, fechamento de período ML', ['MM','Valuation'], mm);

  const fico = await n('FI/CO – Finance & Controlling', 'modulo', 'Finanças e controladoria', ['FI','CO','Funcional'], funcional);
  await n('Contabilidade Financeira (FI)', 'processo', 'Plano de contas, lançamentos (FB01/F-02), partidas em aberto', ['FI','Accounting'], fico);
  await n('Contas a Pagar & Receber (AP/AR)', 'processo', 'Vendor/Customer invoices, compensação, extrato de conta', ['FI','AP','AR'], fico);
  await n('Centros de Custo & Ordens Internas', 'processo', 'KS01 CC, KO01 Ordem Interna, settlements, reports CO', ['CO','CostCenter','IO'], fico);
  await n('Resultados & PA (Profitability Analysis)', 'processo', 'CO-PA, características de resultado, valuação, reports', ['CO','COPA'], fico);
  await n('Fechamento Contábil (Período)', 'processo', 'Depreciação AA, reclassificações, accruals, balance carryforward', ['FI','Closing'], fico);

  const pp = await n('PP – Production Planning', 'modulo', 'Planejamento e controle da produção', ['PP','Funcional'], funcional);
  await n('Ordens de Produção (CO01)', 'processo', 'Criação, liberação, confirmação, TECO – ciclo de produção', ['PP','Order','CO01'], pp);
  await n('MPS & MRP PP', 'processo', 'Planejamento mestre de produção, capacidade, pegging', ['PP','MRP','MPS'], pp);
  await n('Listas Técnicas (CS01) & Roteiros (CA01)', 'transacao', 'BOM (CS01/CS11), Routing (CA01), centros de trabalho (CR01)', ['PP','BOM','Routing'], pp);

  const wm = await n('WM/EWM – Warehouse Management', 'modulo', 'Gestão de armazém SAP', ['WM','EWM','Funcional'], funcional);
  await n('Estrutura de Armazém (LX01)', 'processo', 'Complexo, armazém, tipo de estoque, área de estoque, seção', ['WM','Structure'], wm);
  await n('Ordens de Transferência (LT01)', 'transacao', 'Criação/confirmação de TO, estratégias de putaway e picking', ['WM','TransferOrder','LT01'], wm);
  await n('EWM – Extended Warehouse Mgmt', 'processo', 'Diferenças WM x EWM, embedded EWM S/4, tasks, PPF actions', ['EWM','S4HANA'], wm);

  // ─── S/4HANA ──────────────────────────────────────────────────────────────
  console.log('\n📁 S/4HANA');
  const s4 = await n('S/4HANA', 'pasta', 'Conceitos, arquitetura e migração S/4HANA', ['S4HANA','HANA']);

  const migracao = await n('Migração ECC → S/4HANA', 'area', 'Processo de migração para S/4HANA', ['S4HANA','Migração','ECC'], s4);
  await n('Simplification List', 'desenvolvimento', 'Lista de simplificações por release S/4, itens removidos/alterados', ['S4HANA','Simplification'], migracao);
  await n('Readiness Check & Pre-checks', 'processo', 'SAP Readiness Check, SUM DMO, pre-checks de customizing', ['S4HANA','Migration','ReadinessCheck'], migracao);
  await n('Migração de Dados (LTMC/LTMOM)', 'processo', 'Legacy Transfer Migration Cockpit, objeto de migração, templates', ['S4HANA','LTMC','DataMigration'], migracao);
  await n('Clean Core Strategy', 'processo', 'Princípios clean core, extensibility options, custom code check', ['S4HANA','CleanCore'], migracao);

  const acdoca = await n('Universal Journal (ACDOCA)', 'area', 'Nova contabilidade unificada S/4HANA', ['S4HANA','ACDOCA','FI','CO'], s4);
  await n('Estrutura ACDOCA', 'desenvolvimento', 'Tabela ACDOCA, campos-chave, relacionamento FI-CO unificado', ['S4HANA','ACDOCA'], acdoca);
  await n('Impacto em Reports & Queries ABAP', 'desenvolvimento', 'Substituição BSEG/COEP, joins ACDOCA, CDS views FI/CO', ['S4HANA','ACDOCA','Report'], acdoca);

  const analytics = await n('Embedded Analytics', 'area', 'Analytics nativo S/4HANA', ['S4HANA','Analytics','BW'], s4);
  await n('CDS Analytics Views', 'desenvolvimento', '@Analytics.query:true, @Analytics.dataCategory:#CUBE/#DIMENSION, KPI', ['S4HANA','CDS','Analytics'], analytics);
  await n('Query Browser & KPI Framework', 'processo', 'Fiori app Query Browser, Tile com KPI, Smart Business', ['S4HANA','KPI','Analytics'], analytics);
  await n('SAC & BW/4HANA Integration', 'processo', 'SAP Analytics Cloud live connection, BW/4HANA side-by-side', ['S4HANA','SAC','BW'], analytics);

  const arq = await n('Arquitetura S/4HANA', 'area', 'Conceitos de arquitetura e infraestrutura S/4HANA', ['S4HANA','Arquitetura','HANA'], s4);
  await n('In-Memory Computing (HANA)', 'desenvolvimento', 'Row store vs column store, compressão, delta merge, MVCC', ['HANA','InMemory'], arq);
  await n('Simplificações de Tabelas', 'desenvolvimento', 'BKPF→ACDOCA, MARD→MATDOC, KONV→PRCD_ELEMENTS – impacto ABAP', ['S4HANA','Tables','Simplification'], arq);
  await n('Releases S/4HANA (1909 → 2023+)', 'area', 'Novidades por release: 1909, 2020, 2021, 2022, 2023, 2024', ['S4HANA','Release'], arq);

  // ─── FERRAMENTAS & PERFORMANCE ────────────────────────────────────────────
  console.log('\n📁 Ferramentas & Performance');
  const tools = await n('Ferramentas & Performance', 'pasta', 'Ferramentas SAP para desenvolvimento, debug e tuning', ['ABAP','Performance','Ferramentas']);

  const debug = await n('Debug & Análise', 'area', 'Debug e análise de programas ABAP', ['ABAP','Debug','Performance'], tools);
  await n('ABAP Debugger (SAP GUI & ADT)', 'desenvolvimento', 'Breakpoints, watchpoints, desktop shortcuts, dual stack, script debugger', ['ABAP','Debug'], debug);
  await n('ST05 – SQL Trace', 'transacao', 'Ativar trace SQL, análise de queries lentas, buffer hits, explain plan', ['Performance','ST05','SQL'], debug);
  await n('SAT / SE30 – Runtime Analysis', 'transacao', 'Hit list, call hierarchy, top statements, ABAP trace com SAT', ['Performance','SAT','SE30'], debug);
  await n('SM50/SM66 – Work Processes', 'transacao', 'Monitor de work processes, processos em fila, locks (SM12)', ['Basis','SM50','SM66','Performance'], debug);
  await n('SCI – Code Inspector', 'transacao', 'Verificações estáticas: performance, segurança, naming, best practices', ['ABAP','SCI','CodeQuality'], debug);

  const tms = await n('Transport Management', 'area', 'Gestão de transportes e ambientes SAP', ['TMS','Transport','Basis'], tools);
  await n('Ordens de Transport (SE09/SE10)', 'transacao', 'Workbench, Customizing orders, tasks, release, export', ['TMS','SE09','SE10'], tms);
  await n('TMS – Transport Management System', 'processo', 'STMS configuração, rotas, domínio, import queue, logs de import', ['TMS','STMS','Basis'], tms);
  await n('Estratégias de Transport', 'processo', 'Best practices: 3-tier landscape, hot fix, retransport, S/4 specifics', ['TMS','Strategy'], tms);

  const auth = await n('Segurança & Autorização', 'area', 'Autorizações e segurança ABAP', ['Auth','PFCG','Security'], tools);
  await n('Objetos de Autorização (SU21)', 'transacao', 'Criar/modificar objetos, campos de autorização, classes de objeto', ['Auth','SU21','Security'], auth);
  await n('PFCG – Roles & Profiles', 'transacao', 'Criar roles, menu, autorizações, perfis, atribuição a usuários', ['Auth','PFCG','Role'], auth);
  await n('AUTHORITY-CHECK em ABAP', 'desenvolvimento', 'AUTHORITY-CHECK OBJECT, SY-SUBRC, dummy checks, best practices', ['Auth','ABAP','Security'], auth);
  await n('SU53 & SU56 – Análise de Auth', 'transacao', 'SU53 última verificação falha, SU56 buffer de autorização do usuário', ['Auth','SU53','Debug'], auth);

  console.log('\n✅ Concluído!');

  // Verificar total
  const count = await new Promise((resolve) => {
    http.get('http://localhost:3001/api/nodes', res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve(JSON.parse(buf).length));
    });
  });
  console.log(`📊 Total de nós no banco: ${count}`);

  process.exit(0);
}

seed().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
