export async function setCipboard(text) {
  if (!navigator.clipboard) {
    throw new Error("Браузер не поддерживает доступ к буферу обмена");
  }
  
  try {
    const type = "text/plain";
    const clipboardItemData = {
      [type]: text,
    };
    const clipboardItem = new ClipboardItem(clipboardItemData);
    await navigator.clipboard.write([clipboardItem]);
  } catch (error) {
    console.error("Ошибка копирования:", error);
    throw new Error("Не удалось скопировать в буфер обмена. Возможно, требуется SSL сертификат или разрешение на доступ.");
  }
}