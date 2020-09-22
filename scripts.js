const photo = document.getElementById("photo-file");

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

    // Ler arquivo
    let reader = new FileReader();
    reader.readAsDataURL(file);

    /** Assim que terminar o carregamento da imagem, passamos o resultado do reader para
     * o src da tag img no html
    */
    reader.onload = function (event) {
      let image = document.getElementById("photo-preview");
      image.src = event.target.result;
    };
  });
});
