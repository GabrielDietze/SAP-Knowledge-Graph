const { db, uuidv4 } = require('./database');

if (db.get('nodes').size().value() > 0) {
  console.log('Database already seeded, skipping.');
  process.exit(0);
}

const ids = {};

const node = (key, title, type, description, tags = [], parent = null, x = 0, y = 0) => {
  const id = uuidv4();
  ids[key] = id;
  const n = {
    id, title, type, description,
    content: '',
    tags,
    parent_id: parent ? ids[parent] : null,
    pos_x: x,
    pos_y: y,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.get('nodes').push(n).write();
  return id;
};

const edge = (source, target, label, type = 'default') => {
  db.get('edges').push({
    id: uuidv4(),
    source: ids[source],
    target: ids[target],
    label,
    type,
    created_at: new Date().toISOString(),
  }).write();
};

// Root modules
node('sd', 'SD - Sales & Distribution', 'modulo', 'Módulo de Vendas e Distribuição', ['vendas', 'logística'], null, 100, 100);
node('mm', 'MM - Materials Management', 'modulo', 'Módulo de Gestão de Materiais', ['compras', 'estoque'], null, 400, 100);
node('fi', 'FI - Financial Accounting', 'modulo', 'Módulo de Contabilidade Financeira', ['finanças', 'contabilidade'], null, 700, 100);
node('co', 'CO - Controlling', 'modulo', 'Módulo de Controladoria', ['custos', 'controladoria'], null, 1000, 100);
node('pp', 'PP - Production Planning', 'modulo', 'Módulo de Planejamento de Produção', ['produção', 'MRP'], null, 100, 380);
node('wm', 'WM - Warehouse Management', 'modulo', 'Módulo de Gestão de Armazém', ['armazém', 'estoque'], null, 400, 380);
node('btp', 'BTP - Business Technology Platform', 'btp', 'Plataforma de tecnologia da SAP', ['cloud', 'platform'], null, 700, 380);
node('cpi', 'CPI - Integration Suite', 'cpi', 'SAP Integration Suite / CPI', ['integração', 'middleware'], null, 1000, 380);
node('fiori', 'SAP Fiori / UI5', 'fiori', 'Framework de UX da SAP', ['frontend', 'ux', 'ui5'], null, 100, 660);
node('abap', 'ABAP Development', 'desenvolvimento', 'Desenvolvimento ABAP customizações', ['abap', 'desenvolvimento'], null, 400, 660);
node('integracoes', 'Integrações', 'integracao', 'Integrações entre sistemas', ['RFC', 'IDoc', 'SOAP', 'REST'], null, 700, 660);

// SD children
node('sd_vendas', 'Vendas', 'area', 'Área de Vendas no SD', ['SD', 'vendas'], 'sd', 50, 50);
node('sd_expedicao', 'Expedição', 'area', 'Área de Expedição no SD', ['SD', 'expedição'], 'sd', 350, 50);
node('sd_faturamento', 'Faturamento', 'area', 'Área de Faturamento no SD', ['SD', 'faturamento'], 'sd', 650, 50);

// SD Vendas
node('sd_ped_venda', 'Pedido de Venda', 'processo', 'Processo de criação de pedido de venda', ['VA01', 'VA02', 'VA03'], 'sd_vendas', 50, 50);
node('sd_cotacao', 'Cotação', 'processo', 'Processo de cotação ao cliente', ['VA21', 'VA22', 'VA23'], 'sd_vendas', 320, 50);
node('sd_contrato', 'Contrato de Venda', 'processo', 'Contratos de venda com clientes', ['VA41', 'VA42'], 'sd_vendas', 590, 50);

// Pedido de Venda
node('sd_criar_ped', 'Criar Pedido (VA01)', 'transacao', 'Transação VA01 - Criar pedido de venda', ['VA01'], 'sd_ped_venda', 50, 50);
node('sd_alterar_ped', 'Alterar Pedido (VA02)', 'transacao', 'Transação VA02 - Alterar pedido de venda', ['VA02'], 'sd_ped_venda', 300, 50);
node('sd_exibir_ped', 'Exibir Pedido (VA03)', 'transacao', 'Transação VA03 - Exibir pedido de venda', ['VA03'], 'sd_ped_venda', 550, 50);

// SD Expedição
node('sd_remessa', 'Remessa', 'processo', 'Processo de remessa de mercadorias', ['VL01N', 'VL02N', 'VL03N'], 'sd_expedicao', 50, 50);
node('sd_transp', 'Transporte', 'processo', 'Gestão de transportes', ['VT01N'], 'sd_expedicao', 320, 50);

// Remessa
node('sd_criar_rem', 'Criar Remessa (VL01N)', 'transacao', 'Criação de remessa de saída', ['VL01N', 'entrega'], 'sd_remessa', 50, 50);
node('sd_alterar_rem', 'Alterar Remessa (VL02N)', 'transacao', 'Alteração de remessa de saída', ['VL02N'], 'sd_remessa', 300, 50);
node('sd_picking', 'Picking', 'processo', 'Processo de separação de materiais', ['picking', 'armazém'], 'sd_remessa', 550, 50);
node('sd_saida_merc', 'Saída de Mercadoria', 'processo', 'Lançamento de saída de mercadoria', ['SM', 'estoque'], 'sd_remessa', 800, 50);
node('sd_estorno_rem', 'Estorno de Remessa', 'processo', 'Cancelamento/estorno de remessa', ['VL09', 'estorno'], 'sd_remessa', 1050, 50);

// SD Faturamento
node('sd_fatura', 'Fatura (VF01)', 'processo', 'Criação de fatura de cliente', ['VF01', 'billing'], 'sd_faturamento', 50, 50);
node('sd_nota_credito', 'Nota de Crédito', 'processo', 'Emissão de nota de crédito', ['VA01', 'crédito'], 'sd_faturamento', 320, 50);
node('sd_nota_debito', 'Nota de Débito', 'processo', 'Emissão de nota de débito', ['VA01', 'débito'], 'sd_faturamento', 590, 50);
node('sd_criar_fatura', 'Criar Fatura (VF01)', 'transacao', 'Transação VF01 - Criação de fatura', ['VF01'], 'sd_fatura', 50, 50);

// MM
node('mm_compras', 'Compras', 'area', 'Área de compras no MM', ['MM', 'compras', 'P2P'], 'mm', 50, 50);
node('mm_estoque', 'Gestão de Estoque', 'area', 'Gestão de estoques', ['MM', 'estoque'], 'mm', 350, 50);
node('mm_nf', 'Nota Fiscal / MIRO', 'area', 'Entrada de notas fiscais', ['MIRO', 'nota fiscal'], 'mm', 650, 50);
node('mm_requisicao', 'Requisição de Compra', 'processo', 'Processo de requisição (ME51N)', ['ME51N', 'requisição'], 'mm_compras', 50, 50);
node('mm_pedido_comp', 'Pedido de Compra', 'processo', 'Pedido de compras (ME21N)', ['ME21N', 'PO'], 'mm_compras', 320, 50);
node('mm_entrada_merc', 'Entrada de Mercadoria', 'processo', 'Lançamento de entrada de mercadoria (MIGO)', ['MIGO', 'GR'], 'mm_estoque', 50, 50);

// BTP
node('btp_subaccount', 'Subaccounts', 'btp', 'Estrutura de subaccounts no BTP', ['BTP', 'subaccount'], 'btp', 50, 50);
node('btp_services', 'Serviços BTP', 'btp', 'Serviços disponíveis no marketplace', ['BTP', 'services'], 'btp', 320, 50);
node('btp_cf', 'Cloud Foundry', 'btp', 'Ambiente Cloud Foundry no BTP', ['CF', 'cloud'], 'btp', 590, 50);
node('btp_kyma', 'Kyma Runtime', 'btp', 'Runtime Kubernetes gerenciado no BTP', ['Kyma', 'kubernetes'], 'btp', 860, 50);

// CPI
node('cpi_iflow', 'iFlows', 'cpi', 'Fluxos de integração no CPI', ['iFlow', 'integração'], 'cpi', 50, 50);
node('cpi_adapters', 'Adapters', 'cpi', 'Adaptadores de conectividade do CPI', ['adapter', 'connector'], 'cpi', 320, 50);
node('cpi_mappings', 'Mapeamentos', 'cpi', 'Message mappings e XSLT no CPI', ['mapping', 'XSLT', 'groovy'], 'cpi', 590, 50);
node('cpi_monitor', 'Monitoramento', 'cpi', 'Monitoramento de mensagens e alertas', ['monitor', 'log'], 'cpi', 860, 50);
node('cpi_http', 'HTTP Adapter', 'cpi', 'Adapter HTTP sender/receiver', ['HTTP', 'REST', 'adapter'], 'cpi_adapters', 50, 50);
node('cpi_idoc', 'IDoc Adapter', 'cpi', 'Adapter para troca de IDocs com SAP', ['IDoc', 'adapter'], 'cpi_adapters', 320, 50);
node('cpi_sftp', 'SFTP Adapter', 'cpi', 'Adapter para transferência de arquivos via SFTP', ['SFTP', 'file'], 'cpi_adapters', 590, 50);
node('cpi_soap', 'SOAP Adapter', 'cpi', 'Adapter SOAP para web services', ['SOAP', 'WS'], 'cpi_adapters', 860, 50);

// Fiori
node('fiori_launchpad', 'Launchpad', 'fiori', 'SAP Fiori Launchpad configuração', ['launchpad', 'tile'], 'fiori', 50, 50);
node('fiori_apps', 'Fiori Apps', 'fiori', 'Catálogo de apps Fiori standard', ['apps', 'catálogo'], 'fiori', 320, 50);
node('fiori_ui5', 'UI5 Custom Apps', 'fiori', 'Desenvolvimento de apps custom SAPUI5', ['UI5', 'custom'], 'fiori', 590, 50);
node('fiori_odata', 'OData Services', 'fiori', 'Serviços OData para apps Fiori', ['OData', 'backend', 'SEGW'], 'fiori', 860, 50);

// ABAP
node('abap_reports', 'Reports / ALV', 'desenvolvimento', 'Relatórios ABAP com ALV Grid', ['report', 'ALV', 'ABAP'], 'abap', 50, 50);
node('abap_badi', 'BAdI / User Exit', 'desenvolvimento', 'Enhancement spots e User Exits', ['BAdI', 'user exit'], 'abap', 320, 50);
node('abap_smartforms', 'SmartForms / Adobe', 'desenvolvimento', 'Formulários SmartForms e Adobe Forms', ['SmartForms', 'PDF'], 'abap', 590, 50);
node('abap_rfc', 'Function Modules / RFC', 'desenvolvimento', 'Function Modules e RFCs habilitadas', ['RFC', 'FM', 'ABAP'], 'abap', 860, 50);
node('abap_classes', 'Classes ABAP OO', 'desenvolvimento', 'Desenvolvimento orientado a objetos ABAP', ['OO', 'class', 'ABAP'], 'abap', 1130, 50);

// Integrações
node('int_rfc', 'RFC', 'integracao', 'Remote Function Call entre sistemas SAP', ['RFC', 'ABAP'], 'integracoes', 50, 50);
node('int_idoc', 'IDoc', 'integracao', 'Intermediate Documents para troca de dados', ['IDoc', 'EDI'], 'integracoes', 320, 50);
node('int_soap', 'SOAP / Web Services', 'integracao', 'Integração via Web Services SOAP', ['SOAP', 'WS'], 'integracoes', 590, 50);
node('int_rest', 'REST API', 'integracao', 'Integração via APIs REST', ['REST', 'API', 'JSON'], 'integracoes', 860, 50);
node('int_bapi', 'BAPI', 'integracao', 'Business APIs SAP padrão', ['BAPI', 'RFC'], 'integracoes', 1130, 50);

// Cross-module edges
edge('sd_saida_merc', 'mm_entrada_merc', 'movimenta estoque');
edge('sd_fatura', 'fi', 'gera lançamento FI');
edge('mm_nf', 'fi', 'gera lançamento FI');
edge('cpi_iflow', 'int_idoc', 'usa');
edge('cpi_iflow', 'int_soap', 'usa');
edge('cpi_iflow', 'int_rest', 'usa');
edge('abap_rfc', 'int_rfc', 'implementa');
edge('fiori_odata', 'abap_classes', 'implementado em');
edge('btp', 'cpi', 'hospeda');
edge('btp', 'fiori', 'hospeda');
edge('mm_estoque', 'wm', 'integra');

console.log('Seed completed! Nodes:', db.get('nodes').size().value());
