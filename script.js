/*Konstanty*/
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
/*Plátno*/
canvas.height = innerHeight;
canvas.width = innerWidth;

const scoreElement = document.querySelector('#scoreElement');
const endScore = document.getElementById('endScore');
const highScore = document.getElementById('highScore');
const btn = document.querySelector('button');
/*Player*/
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    /*Nakreslení Player*/
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}
/*Projectile*/
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    };
    /*Nakreslení Projectile*/
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    };
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    };
};
/*Enemy */
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    };
    /*Nakreslení Projectile*/
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    };
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    };
};

const slowparticles = 0.97;
/*Částečky po zničení nepřítel */
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    };
    /*Nakreslení Projectile*/
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    };
    update() {
        this.draw();
        this.velocity.x *= slowparticles;
        this.velocity.y *= slowparticles;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    };
};
/*Posunutí na Player střed*/
const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 15, 'white');

/*Pole - Array*/
const projectiles = [];
const enemies = [];
const particles = [];

/*Vytváření nepřátel*/
function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x;
        let y;
        if (Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }
        else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        };
        /*Generátor náhodné barvy nepřátel*/
        const color = `hsl( ${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        enemies.push(new Enemy(x, y, radius, color, velocity));
        }, 1000);
}

let animationId
let score = 0;
let hScore = localStorage.getItem("highScore");
    if (hScore !== null) {
        if (score > hScore) {
            localStorage.setItem("hScore", score);
        }
        else{
            localStorage.setItem("hScore", score)
        }
    }
    console.log(hScore);
/*Opakující se funkce*/
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        }
        else{
            particle.update();
        }
    })
    projectiles.forEach(function (projectile, index) {
            projectile.update();
            /*Odstránění projectiles z obrazovky*/
            if (projectile.x + projectile.radius < 0 || 
                projectile.x - projectile.radius > canvas.width ||
                projectile.y + projectile.radius < 0 ||
                projectile.y - projectile.radius > canvas.height) {
                setTimeout(() => {
                    projectiles.splice(index, 1);
                }, 0);
            }
        })

    enemies.forEach((enemy, index) => {
        enemy.update();

        /*Detekce kolize hráče*/
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        /*Ukončení hry, zastavení funkce animate*/
        if (distance - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId);
            endGame.style.display = "block";
            endScore.innerHTML = score;
            // if(confirm("Score: "+score+"\n\nPlay again?")){
            //     location.reload();
            // }
            // else{
            //     alert("Thanks for playing!\n\nJakub Hudymač IT2")
            // }
                
        }

        /*Vzdálenost nepřátel od střely*/
        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            /*Detekce kolize střely a zničení nepřátel*/
            if (distance - enemy.radius - projectile.radius < 1) {
                /*Vybuchování nepřátel*/
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                };

                /*Zmenšování nepřítel*/
                if (enemy.radius - 10 > 5) {
                    /*Score - přidání score za trefení nepřátel */
                    score += 100;
                    scoreElement.innerHTML = score;
                    /*Využití knihovny Gsap - animace zmenšování*/
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    enemy.radius -=10

                /*Plynulejší zničení nepřátel - SetTimeout(0)*/
                setTimeout(() => {
                    projectiles.splice(projectileIndex, 1);
                }, 0);
                }

                else{
                /*Score - bonusové score za celé zničení nepřátel*/
                    score += 150;
                    scoreElement.innerHTML = score;
                /*Plynulejší zničení nepřátel - SetTimeout(0)*/
                setTimeout(() => {
                    enemies.splice(index, 1);
                    projectiles.splice(projectileIndex, 1);
                }, 0);
                }

            }
        });
    })
};


window.addEventListener('click', function(event){
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(
        canvas.width / 2, canvas.height / 2, 5, 'white', velocity
    )
)
})

btn.addEventListener('click', function(){
    location.reload();
})


animate();
spawnEnemies();