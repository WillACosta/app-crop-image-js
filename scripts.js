const photo = document.getElementById("photo-file");
const btnDownload = document.getElementById("download");
const selectionTool = document.getElementById("selection-tool");
const btnCrop = document.getElementById("crop-image");

let preview = document.getElementById("photo-preview");
let image;
let photoName;

/** Select && Preview */

/**
 * Re-criar funcionalidade do click no input de select-file
 * por termos usado um 'display : none' no css
 */
document.getElementById("select-image").onclick = function () {
  photo.click();
};

/** Assim que o DOM terminar de carregar */
window.addEventListener("DOMContentLoaded", () => {
  photo.addEventListener("change", () => {
    let file = photo.files.item(0); // Pega o arquivo carregado na memória
    photoName = file.name;

    // Ler arquivo
    let reader = new FileReader();
    reader.readAsDataURL(file);

    /** Assim que terminar o carregamento da imagem, passamos o resultado do reader para
     * o src da tag img no html
     */
    reader.onload = function (event) {
      image = new Image();
      image.src = event.target.result;
      image.onload = onLoadImage;
    };
  });
});

/** Selection Tool */

let startX,
  startY,
  relativeX,
  relativeY,
  endX,
  endY,
  relativeEndX,
  relativeEndY;

let keySelector = false;

// Versão resumida de key : value
const events = {
  mouseover() {
    // this : Nesse contexto é quem chamou a função, no caso o 'image'
    this.style.cursor = "crosshair";
  },
  mousedown() {
    const {
      clientX,
      clientY,
      offsetX,
      offsetY
    } = event;
    // console.table({
    //   client: [clientX, clientY],
    //   offset: [offsetX, offsetY],
    // });

    startX = clientX;
    startY = clientY;
    relativeX = offsetX;
    relativeY = offsetY;

    keySelector = true;
  },
  mousemove() {
    endX = event.clientX;
    endY = event.clientY;

    if (keySelector) {
      selectionTool.style.display = "initial";
      selectionTool.style.top = `${startY}px`;
      selectionTool.style.left = `${startX}px`;

      selectionTool.style.width = `${endX - startX}px`;
      selectionTool.style.height = `${endY - startY}px`;
    }
  },
  mouseup() {
    keySelector = false;

    relativeEndX = event.layerX; // Propiedade de cálculo do deslocamento do mouse
    relativeEndY = event.layerY;

    btnCrop.style.display = "initial";
  },
};

/** Transforma a constante events em um array de chaves
 * e usa o paramêtro como função */
Object.keys(events).forEach((event) => {
  preview.addEventListener(event, events[event]);
});

/** Canvas */

let canvas = document.createElement("canvas");
let context = canvas.getContext("2d");

function onLoadImage() {
  const {
    width,
    height
  } = image;

  canvas.width = width;
  canvas.height = height;

  //Clear Context
  context.clearRect(0, 0, width, height);

  //Draw in Context
  context.drawImage(image, 0, 0);

  preview.src = canvas.toDataURL();
}

/** Realizar cortes */
btnCrop.onclick = () => {
  const {
    width: imgW,
    height: imgH
  } = image;
  const {
    width: previewW,
    height: previewH
  } = preview;

  /** Destruturação em array | Fator de proporção*/
  const [widthFactor, heightFactor] = [+(imgW / previewW), +(imgH / previewH)];

  const [selecionWidth, selecionHeight] = [
    +selectionTool.style.width.replace("px", ""),
    +selectionTool.style.height.replace("px", ""),
  ];

  const [croppedWidth, croppedHeight] = [
    +(selecionWidth * widthFactor),
    +(selecionHeight * heightFactor),
  ];

  const [actualX, actualY] = [
    +(relativeX * widthFactor),
    +(relativeY * heightFactor),
  ];

  // Pegar do contexto as regiões de corte
  const croppedImage = context.getImageData(
    actualX,
    actualY,
    croppedWidth,
    croppedHeight
  );

  //Clear Context
  context.clearRect(0, 0, context.width, context.height);

  //Ajustar proporções
  image.width = canvas.width = croppedWidth;
  image.height = canvas.height = croppedHeight;

  //Adicionarimagem cortada no contexto
  context.putImageData(croppedImage, 0, 0);

  //Ocultar selection tool
  selectionTool.style.display = "none";

  //Atualizar preview
  preview.src = canvas.toDataURL();

  //Exibir o botão de Download
  btnDownload.style.display = "initial";
};

btnDownload.onclick = function () {
  const alink = document.createElement("a");
  alink.download = photoName + "-copy.png";
  alink.href = canvas.toDataURL();
  alink.click();
};