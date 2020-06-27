function Elemento(tagName, className){
    const elemento = document.createElement(tagName)
    elemento.classList.add(className)
    return elemento
}

function Cano(top){
    this.elemento = new Elemento("div", "cano")

    this.borda = new Elemento("div", "borda")
    this.corpo = new Elemento("div", "corpo")

    this.elemento.appendChild(top ? this.corpo : this.borda)
    this.elemento.appendChild(top ? this.borda : this.corpo)

    this.setAltura = altura => this.corpo.style.height = `${altura}px`
}

function Barreira(altura, abertura, x){
    this.elemento = new Elemento("div", "barreira")

    //dois canos top e bottom
    this.canoTop = new Cano(true)
    this.canoBottom = new Cano(false)

    this.sortearAltura = () => {
        const hBorda = 50
        const altMax = (altura - (abertura + 2 * hBorda))
        const alturaTop = Math.random() * altMax
        const alturaBottom = altMax - alturaTop 

        this.canoTop.setAltura(alturaTop)
        this.canoBottom.setAltura(alturaBottom) 
    }

    this.setX = (x) => this.elemento.style.left = `${x}px`
    this.getX = () => this.elemento.style.left.split("px")[0]
    this.getLargura = () => this.elemento.clientWidth

    this.setX(x)
    this.sortearAltura()

    this.elemento.appendChild(this.canoTop.elemento)
    this.elemento.appendChild(this.canoBottom.elemento)
}

function Barreiras(altura, largura, abertura, distancia, notificarPonto) {
    this.arrayBarreiras = [
        new Barreira(altura, abertura, largura),
        new Barreira(altura, abertura, largura + distancia),
        new Barreira(altura, abertura, largura + distancia  * 2),
        new Barreira(altura, abertura, largura + distancia * 3),
    ]

    const deslocamento = 3

    this.animar = () => {
        this.arrayBarreiras.forEach(barra => {
            barra.setX(barra.getX() - deslocamento)

            if(barra.getX() < -barra.getLargura()){
                barra.setX((distancia * 4) + parseInt(barra.getX()))
                barra.sortearAltura()
            }

            const meio = largura / 2
            const cruzouOMeio = parseInt(barra.getX()) + deslocamento >= meio &&
                                parseInt(barra.getX()) < meio 
            
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(altura) {
    this.elemento = new Elemento("img", "player")
    this.elemento.src = "imgs/passaro.png"
    
    this.setY = (y) => this.elemento.style.bottom = `${y}px`
    this.getY = () => this.elemento.style.bottom.split("px")[0]

    let voando = false
    this.setY(altura/2)

    window.onkeydown = (e) => voando = true
    window.onkeyup = (e) => voando = false

    this.animar = () => {
        const novaAltura = (parseFloat(this.getY())) + (voando ? 8 : - 5)
        const alturaMaxima = altura - this.elemento.clientHeight

        if(novaAltura <= 0){
            this.setY(0)
            console.log('1')
        }else if(novaAltura >= alturaMaxima){
            console.log('2')
            this.setY(alturaMaxima)
        }else{
            this.setY(novaAltura) 
        }

    }
}

//funcçção calback de quando uma barreira cruzar o meio da tela
function Contador(){
    this.elemento = new Elemento("spam", "contador")

    this.atualizaPontos = (ponto) => {
        this.elemento.innerHTML = ponto
    }

    this.atualizaPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.arrayBarreiras.forEach(barreira => {
        if (!colidiu) {
            const superior = barreira.canoTop.elemento
            const inferior = barreira.canoBottom.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyApp(){
    //selecionando a tela do jogo:
    const viewFlappy = document.querySelector("[flappy]")

    //atributos importantes da tela
    const altura = viewFlappy.clientHeight
    const largura = viewFlappy.clientWidth

    //caracterias da jogo
    const abertura = 200
    const distancia = 400
    let pontos = 0

    //instanciar os objetos
    const contador = new Contador()
    const barreiras = new Barreiras(altura, largura, abertura, distancia, () => contador.atualizaPontos(++pontos))
    const player = new Passaro(altura)

    //adicionando os elementos na tela
    viewFlappy.appendChild(contador.elemento)
    viewFlappy.appendChild(player.elemento)
    barreiras.arrayBarreiras.forEach(barreira => {
        viewFlappy.appendChild(barreira.elemento)
    })

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            player.animar()
            
            if (colidiu(player, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyApp().start()