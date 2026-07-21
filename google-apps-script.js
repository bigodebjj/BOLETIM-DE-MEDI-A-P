/**
 * GOOGLE APPS SCRIPT - Deploy no Google Drive
 *
 * 1. Acesse https://script.google.com
 * 2. Clique em "Novo projeto"
 * 3. Cole este código
 * 4. Clique em "Implementar" > "Implementar como aplicativo da Web"
 * 5. Configure: Executar como "Eu mesmo", Quem acessa: "Qualquer pessoa"
 * 6. Copie a URL gerada e cole nas Configurações do sistema
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const folderId = data.folderId;
    const fileName = data.fileName;
    const mimeType = data.mimeType;
    const fileBase64 = data.fileBase64;

    if (!folderId || !fileName || !fileBase64) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: 'Parâmetros obrigatórios ausentes' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const folder = DriveApp.getFolderById(folderId);
    const decoded = Utilities.base64Decode(fileBase64);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);
    const file = folder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const fileUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
    const downloadUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: fileId,
      fileUrl: fileUrl,
      downloadUrl: downloadUrl,
      fileName: fileName
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Google Apps Script - Upload de Arquivos Ativo').setMimeType(ContentService.MimeType.TEXT);
}
