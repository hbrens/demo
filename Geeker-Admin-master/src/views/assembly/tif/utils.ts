import UTIF from "utif";

/**
 * 解析 TIF 文件并转换为 PNG Data URL
 * @param url TIF 文件地址
 * @returns PNG Data URL
 */
export async function parseTifToDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();

  const ifds = UTIF.decode(arrayBuffer);
  if (!ifds || ifds.length === 0) {
    throw new Error("无法解析 TIF 文件");
  }

  UTIF.decodeImage(arrayBuffer, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);

  const width = ifds[0].width;
  const height = ifds[0].height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法创建 Canvas 上下文");
  }

  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < rgba.length; i++) {
    imageData.data[i] = rgba[i];
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/png");
}
