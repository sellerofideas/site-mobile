/**
 * Google Apps Script — Web App para formulario de parceiros industriais.
 *
 * 1. Acesse https://script.google.com, crie um novo projeto
 * 2. Cole este codigo e salve
 * 3. Implantar > Nova implantacao > Web App
 *    - Executar como: "Eu"
 *    - Quem pode acessar: "Qualquer pessoa"
 * 4. Copie a URL gerada e cole em forms.html na variavel APPS_SCRIPT_URL
 */

var SPREADSHEET_ID = '1AxtyKUwo5Y4fviyMbZo3IiHarvE2om3eDr8zoyxsUAY';
var SHEET_NAME = 'Comparativo Suplementos';

// Mapeamento: indice da coluna (0-based) -> funcao que extrai o valor dos dados limpos
function buildRow(clean) {
  var row = [];
  row[0]  = clean.companyName || '';                          // Empresa
  row[1]  = clean.moq || '';                                   // MOQ Estimado
  row[2]  = clean.investment || '';                            // Invest. Inicial
  row[3]  = clean.leadTime || '';                              // Prazo Medio
  row[4]  = montaProdutos(clean);                               // Produtos
  row[5]  = '';                                                 // Contactada (manual)
  row[6]  = clean.website || '';                                // Site
  row[7]  = montaContatos(clean);                                // Contatos
  row[8]  = clean.factoryAddress || '';                         // Endereco
  row[9]  = clean.logistics || '';                              // Logistica
  row[10] = clean.productTesting || '';                         // Degustacao
  row[11] = clean.labelService || '';                           // Rotulo
  row[12] = montaDocumentacao(clean);                           // Documentacao
  row[13] = '';                                                 // Avaliacoes RA (manual)
  row[14] = clean.brandsServed || '';                           // Marcas
  row[15] = '';                                                 // AV Marcas (manual)
  row[16] = '';                                                 // Atendimento (manual)
  row[17] = '';                                                 // Nota (manual)
  row[18] = clean.differential || '';                            // Diferencial
  return row;
}

function montaProdutos(d) {
  var partes = [];
  if (Array.isArray(d.products) && d.products.length) {
    partes.push(d.products.join(', '));
  }
  if (d.otherProducts) {
    partes.push('Outros: ' + d.otherProducts);
  }
  return partes.join(' | ');
}

function montaContatos(d) {
  var partes = [];
  if (d.phone) partes.push('Tel: ' + d.phone);
  if (d.email) partes.push('Email: ' + d.email);
  return partes.join(' | ');
}

function montaDocumentacao(d) {
  var partes = [];
  if (Array.isArray(d.docs) && d.docs.length) {
    partes.push(d.docs.join(', '));
  }
  if (d.otherDocs) {
    partes.push('Outros: ' + d.otherDocs);
  }
  return partes.join(' | ');
}

function doGet() {
  return HtmlService.createHtmlOutput(
    '<h1>Acesso negado</h1><p>Este endpoint aceita apenas requisicoes POST.</p>'
  ).setTitle('MeuZovo - Parceiro Industrial');
}

function doPost(e) {
  var respHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responder(400, 'Dados invalidos ou ausentes.', respHeaders);
    }

    var raw = e.postData.contents;
    var data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      return responder(400, 'Formato invalido. Envie JSON.', respHeaders);
    }

    // Sanitizacao
    var clean = {};
    Object.keys(data).forEach(function (key) {
      if (typeof data[key] === 'string') {
        clean[key] = sanitizar(data[key]);
      } else if (Array.isArray(data[key])) {
        clean[key] = data[key].map(function (v) {
          return typeof v === 'string' ? sanitizar(v) : v;
        });
      } else {
        clean[key] = data[key];
      }
    });

    // Valida obrigatorios
    var obrigatorios = ['companyName', 'moq', 'leadTime', 'factoryAddress', 'phone', 'email', 'logistics', 'productTesting', 'labelService'];
    for (var i = 0; i < obrigatorios.length; i++) {
      if (!clean[obrigatorios[i]] || clean[obrigatorios[i]].trim() === '') {
        return responder(400, 'Campo obrigatorio ausente: ' + obrigatorios[i], respHeaders);
      }
    }

    // Valida email
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean.email)) {
      return responder(400, 'E-mail invalido.', respHeaders);
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    var row = buildRow(clean);
    sheet.appendRow(row);

    return responder(200, 'OK', respHeaders);

  } catch (err) {
    return responder(500, 'Erro interno: ' + err.message, respHeaders);
  }
}

function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

function responder(status, message, extraHeaders) {
  var output = ContentService.createTextOutput(
    JSON.stringify({ status: status, message: message })
  ).setMimeType(ContentService.MimeType.JSON);

  if (extraHeaders) {
    Object.keys(extraHeaders).forEach(function (k) {
      output.setHeader(k, extraHeaders[k]);
    });
  }
  return output;
}

function sanitizar(str) {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
