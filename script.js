const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")//necessário quando trabalhar com canvas
const score = document.querySelector(".score--value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")
const lastScore = document.querySelector(".last-score-value")

//para evitar que a cobra se mova depois do gameover
let gameActive = true//game ativo é true

const audio = new Audio("../audio/audio.mp3") //audio food
const audio_gameOver = new Audio("../audio/gameover.mp4")//audio gameover

//para evitar que o audio do gameover fique rodando
let gameOverAudioPlayed = false

//tamanho de cada bloco
const size = 30 

//posição inicial
const initialPosition = { x: 270, y: 240 } 

//cobra com sua posição inicial
let snake = [initialPosition]

//colocando o score +10 pontos
const incrementScore = () => {
    score.innerText = +score.innerText + 10//add 10 ao score atual
}

//sincronizar score atual e recorde 
const updateLastScore = () => {
    const currentScore = parseInt(score.innerText)//atual score
    const recordScore = parseInt(lastScore.innerText)//recorde 

    if (currentScore > recordScore) {
        lastScore.innerText = currentScore 
        //atualiza o recorde para sincronizar com o score atual 
    }
}

//gera número aleatório entre dois períodos
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
    //Math.random  gera um número menor que 1 ou maior que zero
    //Math.round  arredonda o valor para 1 ou 0
    //Math.random() * 5 para  gerar até um número específico(5)
    //Math.random() * 10 + 5  soma para ter mínimo(5), n pode vir menor que 5
    //Math.random() * (10 - 5) + 5   para definir um número máximo(10) e um mínimo(5) 
}

//gera uma posição aleatória
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    //pega o número aleatório gerado anteriormente

    return Math.round(number / 30) * 30
    //para a posição ser um múltiplo de 30
}

//gerar uma cor aleatória para a comida
const randomColor = () => {
    //pega um número aleatório entre 0 e 255
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)
    return `rgb(${red}, ${green}, ${blue})`
}

//comida
const food = {
    //gera posições e cor aleatória
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

//inicia duas variáveis
let direction, loopId

//definições comida
const drawFood = () => {
    //pega as posições e a cor da comida
    const { x, y, color } = food

    ctx.shadowColor = color//coloca uma sombra 
    ctx.shadowBlur = 6//coloca um sombreado
    ctx.fillStyle = color//coloca a cor
    ctx.fillRect(x, y, size, size)//define a posição
    ctx.shadowBlur = 0//zerar blur pra ele ficar só na comida e não em tudo
}

//definições cobra
const drawSnake = () => {
    ctx.fillStyle = "#ddd"//define cor

    //percorrer o snake
    snake.forEach((position, index) => {
        if (index == snake.length - 1) {//se for o último quadrado
            ctx.fillStyle = "white"
        }
        ctx.fillRect(position.x, position.y, size, size)//define a posição 
    })
}

//movimentação da cobra
const moveSnake = () => {
    //se jogo ativado for falso ou a direção for diferente retorna
    if (!gameActive || !direction) return

    //movimentar a partir da cabeça(último elemento)
    const head = snake[snake.length - 1]//pegar último elemento

    //conforme a direção ela vira para o respectivo lado
    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    } 
    else if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    } 
    else if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    } 
    else if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size })
    }
    snake.shift()
}

//definições grid
const drawGrid = () => {
    ctx.lineWidth = 1 //onde começa
    ctx.strokeStyle = " #a8e2b4" //cor do fundo do canva

    //percorre de ponto a ponto(cordenadas) para desenhar linhas 
    for (let i = 30; i < canvas.width; i += 30) {
        //linhas na vertical
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()
        //linhas na horizontal
        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}

//verificar se a cobra comeu a comida
const chackEat = () => {
    //pega a cabeça dela (último elemento)
    const head = snake[snake.length - 1]

    //verifica se a posição da cabeça é a mesma que a da comida
    if (head.x == food.x && head.y == food.y) {
        incrementScore()//ativa os score(porque comeu)
        updateLastScore()
        snake.push(head)//adiciona a nova cabeça a cobra
        audio.play()//inicia o audio 

        let x = randomPosition()//gera número aleatório
        let y = randomPosition()//gera número aleatório
        //percorre pela cobra para verificar se a comida tem a mesma posição da cobrinha
        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
            //enquanto tiver a mesma posição ela gera outros números
        }

        //para gerar uma nova posição para comida com base nos números escolhidos acima
        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

//verificar se houve colisão
const checkCollision = () => {
    const head = snake[snake.length - 1]//pega a cabeça da cobra
    const canvasLimit = canvas.width - size//define um limite para o canvas
    const neckIndex = snake.length - 2//define que sera a partir da cabeça

    //colisão com a parede(coordenadas)
    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    //colisão com si mesmo(coordenadas)
    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    //verificar se houve colisão perdeu o jogo
    if (wallCollision || selfCollision) {
        gameOver()
    }
}

//para quando for eliminado
const gameOver = () => {
    updateLastScore() //atualiza o recorde
    gameActive = false //define o game ativo como falso/para resetar
    direction = undefined //elimina a direção

    //verifica se gameOverAudioPlayed está ativo(true), então toca o audio
    if (!gameOverAudioPlayed) {
        audio_gameOver.play() //toca o áudio de game over
        gameOverAudioPlayed = true //marca que o áudio foi tocado
    }

    //ativa o menu na tela
    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(5px)"//adiciona um blur no fundo
}

//para criar um loop (mover a cobra e desenhar)
const gameLoop = () => {
    clearInterval(loopId)//para limpar os loops passados toda a vez

    ctx.clearRect(0, 0, 600, 600)//limpar a tela para o novo desenho
    drawGrid()//para desenhar o grid denovo
    drawFood()//para desenhar a comida denovo
    moveSnake()//para mover a cobra
    drawSnake()//desenhar a cobra
    chackEat()//checar se ela comeu
    checkCollision()//checar colisão

    //para fazer o loop
    loopId = setTimeout(() => {
        gameLoop()
    }, 100)//100milisegundos por loop
}
gameLoop()

//evento de teclado para saber qual a tecla clicada e relacionar
document.addEventListener("keydown", ({ key }) => {
    //verifica se é seta esquerda e se a direção não é direita
    if (key == "ArrowRight" && direction != "left") {
        //a direção será esquerda
        direction = "right"
    } 
    else if (key == "ArrowLeft" && direction != "right") {
        direction = "left"
    } 
    else if (key == "ArrowDown" && direction != "up") {
        direction = "down"
    } 
    else if (key == "ArrowUp" && direction != "down") {
        direction = "up"
    }
})

//quando clicar no botão
buttonPlay.addEventListener("click", () => {
    score.innerText = "00"//reseta o score
    menu.style.display = "none"//tira o menu da tela
    canvas.style.filter = "none"
    snake = [initialPosition]//reseta a posição da cobra
    gameActive = true//game ativo novamente true
    audio_gameOver.pause()//audio gameOver é pausado
    audio_gameOver.currentTime = 0// reiniciado
    gameOverAudioPlayed = false//declara que o audio é falso
})
