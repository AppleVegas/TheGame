const canvas = document.getElementById('thegame')
var mousex = 0
var mousey = 0
var w = $(window).width();
var h = $(window).height();
var oldw = w;
var oldh = h;
var mode = 1

var istouchdevice = false;

if (w < h){
    mode = 0
}

var deathsound = new Audio('death.wav');
var shootsound = new Audio('shoot.wav');
var hitsound = new Audio('hit.wav');
var startsound = new Audio('start.wav');
var dmgsound = new Audio('dmg.wav');
var healsound = new Audio('heal.wav');

function ScreenScale(int)
{
    return w/int
}

function ScreenScaleH(int)
{
    return w/int
}

var screenscale

if (mode == 1)
{
    screenscale = ScreenScale(1366)
}else{
    screenscale = ScreenScaleH(657)
}

function Scale(num)
{
    return (num*screenscale)
}

var curtime = 0
function changeResolution(cnvs, width, height)
{
    cnvs.style.width = width.toString() + "px"
    cnvs.style.height = height.toString() + "px"
    $(cnvs).attr("width", width.toString() + "px");
    $(cnvs).attr("height", height.toString() + "px");
}

function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
}

changeResolution(canvas, w, h)

$(window).resize(function(){
    w = $(window).width();
    h = $(window).height();

    if (mode == 1 && w < h){
        document.location.reload()
    }

    if (mode == 0 && w > h){
        document.location.reload()
    }

    if (mode == 1)
    {
        screenscale = ScreenScale(1366)
    }else{
        screenscale = ScreenScaleH(657)
    }

    changeResolution(canvas, w, h)
});

const ctx = canvas.getContext('2d')

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function Distance(x,y,x1,y1){
    let dx = x1 - x;
    let dy = y1 - y;
    return (dx * dx + dy * dy);
};

function easeInOutCubic(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
}

function angledLine(ctx, x, y, length, width, angle, color)
{
    let rot = angle * Math.PI / 180
    let x2 = x + (length * Math.cos(rot))
    let y2 = y + (length * Math.sin(rot))
    ctx.beginPath();     
    ctx.moveTo(x, y);    
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color
    ctx.lineWidth = width;
    ctx.stroke();   
    ctx.strokeStyle = "white"
}

function Line(ctx, x, y, x2, y2, width, color)
{
    ctx.beginPath();     
    ctx.moveTo(x, y);    
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color
    ctx.lineWidth = width;
    ctx.stroke();   
    ctx.strokeStyle = "white"
}

//$("body").mousemove(function(e) {
//    mousex = e.pageX;
//    mousey = e.pageY;
//})

const TheGame = {
    Settings:{
        TickCount: 60
    },
    Constants:{
        TickHandler: null,
        CurTime: 0,
        SpawnDelay: 2, 
        Started: false,
        GameOver: false,
        HurtRed: 0,
        HealGreen: 0
    },
    Player: {
        RotationTime: 0.5,
        Rotation: 0,
        OldRotation: 0,
        NewRotation: 0,
        WasSpinned: false,
        NewTime: 0,
        Shot: true,
        Score: 0,
        Health: 100,
    },
    Bullets:[],
    Meteors:[]
}

function CurTime(){
    return TheGame.Constants.CurTime
}

TheGame.FireBullet = function(x,y,angle, speed = 1){
    let SingleBullet = {
        Speed: speed,
        X: x,
        Y: y,
        Ang: angle,
        SpawnW: w,
        SpawnH: h
    }
    TheGame.Bullets.push(SingleBullet)
}


TheGame.SpawnMeteor = function(x,y, size = 10, speed = 0.5, healing, twox){
    let SingleMeteor = {
        Speed: speed,
        X: x,
        Y: y,
        Ang: Math.atan2(h/2 - y, w/2 - x)* 180 / Math.PI,
        Size: size,
        SpawnW: w,
        SpawnH: h,
        IsHealing: healing,
        IsTwoX: twox
    }
    TheGame.Meteors.push(SingleMeteor)
}

function handlepress(){
    if (TheGame.Constants.GameOver){
        document.location.reload()
        return;
    }
    if (!TheGame.Constants.Started){
        TheGame.Constants.Started = true
        startsound.play()
        return;
    }
    if (CurTime() - TheGame.Player.NewTime > (TheGame.Player.RotationTime))
    {
        TheGame.Player.Shot = false
        if (TheGame.Player.WasSpinned)
        {
            TheGame.Player.Rotation = TheGame.Player.NewRotation
            TheGame.Player.WasSpinned = false
        }
        TheGame.Player.OldRotation = TheGame.Player.Rotation
        TheGame.Player.NewRotation = (Math.atan2(mousey - h/2, mousex - w/2)* 180 / Math.PI)
        TheGame.Player.NewTime = CurTime()
        //TheGame.FireBullet(w/2,h/2, TheGame.Player.Rotation, 4)
    }
}

//$( "body" ).click(function() {
//    handlepress()
//});
canvas.addEventListener('touchstart', function(e) {
    istouchdevice = true
    let touch = e.touches[0];
    mousex = touch.pageX;
    mousey = touch.pageY;

    handlepress()
})

canvas.addEventListener('mousedown', function(e) {
    if (!istouchdevice)
    {
        mousex = e.clientX;
        mousey = e.clientY;

        handlepress()
    }
})


function BulletMove(){
    for (let i = 0; i < TheGame.Bullets.length; i++) {
        if (TheGame.Bullets[i].SpawnW != w)
        {
            TheGame.Bullets[i].X = TheGame.Bullets[i].X * (w / TheGame.Bullets[i].SpawnW)
            TheGame.Bullets[i].SpawnW = w
        }
        if (TheGame.Bullets[i].SpawnH != h)
        {
            TheGame.Bullets[i].Y = TheGame.Bullets[i].Y * (h / TheGame.Bullets[i].SpawnH)
            TheGame.Bullets[i].SpawnH = h
        }
        if (TheGame.Bullets[i].X >= w || TheGame.Bullets[i].X <= 0)
        {
            TheGame.Bullets.splice(i, 1)
            continue;
        }
        if (TheGame.Bullets[i].Y >= h || TheGame.Bullets[i].Y <= 0)
        {
            TheGame.Bullets.splice(i, 1)
            continue;
        }

        let rot = TheGame.Bullets[i].Ang * Math.PI /180
        let bulletspeed = Scale(TheGame.Bullets[i].Speed)
        dx = (Math.cos(rot) * bulletspeed);
        dy = (Math.sin(rot) * bulletspeed)
        TheGame.Bullets[i].X += dx
        TheGame.Bullets[i].Y += dy
    }
}
function MeteorMove(){
    for (let i = 0; i < TheGame.Meteors.length; i++) {
        let scale = Scale(TheGame.Meteors[i].Size)
        let scaletopow = scale*scale
        let sizebyfour = TheGame.Meteors[i].Size/4
        if (TheGame.Meteors[i].SpawnW != w)
        {
            TheGame.Meteors[i].X = TheGame.Meteors[i].X * (w / TheGame.Meteors[i].SpawnW)
            TheGame.Meteors[i].SpawnW = w
            TheGame.Meteors[i].Ang = Math.atan2(h/2 - TheGame.Meteors[i].Y, w/2 - TheGame.Meteors[i].X)* 180 / Math.PI
        }
        if (TheGame.Meteors[i].SpawnH != h)
        {
            TheGame.Meteors[i].Y = TheGame.Meteors[i].Y * (h / TheGame.Meteors[i].SpawnH)
            TheGame.Meteors[i].SpawnH = h
            TheGame.Meteors[i].Ang = Math.atan2(h/2 - TheGame.Meteors[i].Y, w/2 - TheGame.Meteors[i].X)* 180 / Math.PI
        }
        let deleted = false
        if (Distance(TheGame.Meteors[i].X, TheGame.Meteors[i].Y, w/2, h/2) <= scaletopow)
        {
            
            TheGame.Constants.HurtRed = 150
            let resulthp = TheGame.Player.Health - Math.round(sizebyfour)
            if (resulthp > 0){
                TheGame.Player.Health = resulthp
                dmgsound.play()
            }else{
                TheGame.Player.Health = 0
            }
            TheGame.Meteors.splice(i, 1)
            continue;
        }

        for (let j = 0; j < TheGame.Bullets.length; j++) {
            if (Distance(TheGame.Meteors[i].X, TheGame.Meteors[i].Y, TheGame.Bullets[j].X, TheGame.Bullets[j].Y) <= scaletopow)
            {
                TheGame.Player.Score += Math.round(sizebyfour)
                if (TheGame.Meteors[i].IsHealing){
                    TheGame.Constants.HealGreen = 150
                    TheGame.Player.Health = clamp(TheGame.Player.Health + Math.round(sizebyfour), 0, 100)  
                    healsound.play()
                }else{
                    hitsound.play()
                }
                deleted = true
                TheGame.Meteors.splice(i, 1)
                TheGame.Bullets.splice(j, 1)
                break;
            }
        }
        if (deleted){
            continue;
        }

        let rot = TheGame.Meteors[i].Ang * Math.PI /180
        let meteorspeed = Scale(TheGame.Meteors[i].Speed)
        dx = (Math.cos(rot) * meteorspeed);
        dy = (Math.sin(rot) * meteorspeed)
        TheGame.Meteors[i].X += dx
        TheGame.Meteors[i].Y += dy
    }
}
var lastspawned = CurTime()
function MeteorSpawner(){
    if (CurTime() - lastspawned >= TheGame.Constants.SpawnDelay){
        let size = getRandomInt(20,80)
        let XorY = getRandomInt(0,1)
        let PosX
        let PosY
        let healing = false
        let twox = false
        if (XorY){
            PosX = getRandomInt(0,1)
            if (PosX)
            {
                PosX = w + Scale(size)
            }else{
                PosX = Scale(size) * -1
            }
            PosY = getRandomInt(0,h)
        }else{
            if (PosY)
            {
                PosY = h + Scale(size)
            }else{
                PosY = Scale(size) * -1
            }
            PosX = getRandomInt(0,w)
        }
        if (TheGame.Player.Health < 100)
        {
            let rand = getRandomInt(1, 5)
            if (rand == 5){
                healing = true
            }
        }
        TheGame.SpawnMeteor(PosX,PosY,size, getRandomInt(1, 5), healing, twox)
        lastspawned = CurTime()
    }
}

function Tick(){
    if (!TheGame.Constants.Started || TheGame.Constants.GameOver){return}
    if (TheGame.Player.Health == 0){
        TheGame.Constants.GameOver = true
        deathsound.play()
        return
    }
    TheGame.Constants.CurTime += 1/TheGame.Settings.TickCount

    BulletMove()
    MeteorMove()
    MeteorSpawner()
    if (TheGame.Constants.HurtRed > 0)
    {
        TheGame.Constants.HurtRed -= 2
    }
    if (TheGame.Constants.HealGreen > 0)
    {
        TheGame.Constants.HealGreen -= 2
    }
    if (CurTime() - TheGame.Player.NewTime <= (TheGame.Player.RotationTime))
    {
        let add = (TheGame.Player.NewRotation - TheGame.Player.OldRotation)
        if (add >= 180 || add <= -180)
        {
            TheGame.Player.WasSpinned = true
            add = ((180 - Math.abs(TheGame.Player.OldRotation)) + (180 - Math.abs(TheGame.Player.NewRotation)))
            //console.log(add)
            if (TheGame.Player.NewRotation > TheGame.Player.OldRotation){
                TheGame.Player.Rotation = easeInOutCubic((CurTime() - TheGame.Player.NewTime)/(TheGame.Player.RotationTime), TheGame.Player.OldRotation, add*-1, 1);
            }else{
                TheGame.Player.Rotation = easeInOutCubic((CurTime() - TheGame.Player.NewTime)/(TheGame.Player.RotationTime), TheGame.Player.OldRotation, add, 1);
            }
            
        }else{
            TheGame.Player.Rotation = easeInOutCubic((CurTime() - TheGame.Player.NewTime)/(TheGame.Player.RotationTime), TheGame.Player.OldRotation, add, 1);
        }
    }else{
        if (!TheGame.Player.Shot){
            TheGame.Player.Shot = true
            TheGame.FireBullet(w/2,h/2, TheGame.Player.Rotation, 4)
            shootsound.play()
        }
    }

}
TheGame.Constants.TickHandler = setInterval(Tick, 1000 / TheGame.Settings.TickCount)

function DrawBullets(){
    for (let i = 0; i < TheGame.Bullets.length; i++) {
        ctx.translate(TheGame.Bullets[i].X, TheGame.Bullets[i].Y);
        let rot = (TheGame.Bullets[i].Ang - 90) * Math.PI /180
        ctx.fillStyle = "white"
        let size = Scale(5)
        ctx.rotate(rot);
        Line(ctx, 0, 0, 0, Scale(10), 1, "white")
        ctx.fillRect(0 - (size/2), 0 - (size/2), size, size)
        ctx.resetTransform();
        ctx.fillStyle = "white"
    }
}

function DrawMeteors(){
    for (let i = 0; i < TheGame.Meteors.length; i++) {
        ctx.translate(TheGame.Meteors[i].X, TheGame.Meteors[i].Y);

        let rot = (TheGame.Meteors[i].Ang - 90) * Math.PI /180
        
        ctx.rotate(rot);

        //Line(ctx, 0, 0, 0, Scale(10), 1, "white")
        
        ctx.fillStyle = "gray"
        ctx.beginPath();
        ctx.arc(0, 0, Scale(TheGame.Meteors[i].Size), 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.lineWidth = Scale(3);
        ctx.strokeStyle = '#4a4a4a';
        ctx.stroke();
        ctx.resetTransform();
        
        if (TheGame.Meteors[i].IsHealing)
        {
            ctx.save();
            ctx.translate(TheGame.Meteors[i].X, TheGame.Meteors[i].Y);
            ctx.textBaseline = "middle";
            ctx.textAlign = "center"
            ctx.font = "bold "+Scale(TheGame.Meteors[i].Size)+"px serif"
            ctx.fillStyle = "rgba(255,100,100,1)"
            ctx.fillText("+", 0,0);
            ctx.lineWidth = Scale(1);
            ctx.strokeStyle = "black"
            ctx.strokeText("+",0,0)
            ctx.restore();
        }

        
        
        ctx.fillStyle = "white"
    }
}

var lasttime = 0
var frames = 0
var fps = 0

function draw(time){
    
    ctx.clearRect(0, 0, w, h);
    frames = frames + 1
    let diff = time - lasttime
    if (diff >= 100)
    {
        lasttime = time
        fps = Math.round((frames/diff)*1000)
        frames = 0
    }
   
    DrawBullets()
    DrawMeteors()

    //TheGame.Player.Rotation = TheGame.Player.Rotation + 1
    //if (TheGame.Player.Rotation >= 360){
    //    TheGame.Player.Rotation = 0
    //}

   //let cos = (mousex - (w/2)) / Distance(w/2,h/2, mousex, mousey)
   //TheGame.Player.Rotation = Math.acos(cos)*180/Math.PI
   
    //ctx.font = Scale(32)+"px NafteraBoldItalic";
    //ctx.fillText(mousex, Scale(10), Scale(60));
    //ctx.fillText(mousey, Scale(10), Scale(90));
    //ctx.fillText(TheGame.Player.OldRotation, 10, Scale(120));
    //ctx.fillText((TheGame.Player.NewRotation - TheGame.Player.OldRotation), 10, Scale(150));
    //angledLine(ctx, w/2, h/2, w*h, 1, TheGame.Player.Rotation, "white") 
    
    ctx.translate(w/2, h/2);

    let rot = (TheGame.Player.Rotation - 90) * Math.PI /180

    ctx.rotate(rot);
    Line(ctx, 0, 0, 0, w*h, Scale(1), "rgba(255,0,0,0.5)")
    ctx.fillStyle = "white"
    let size = Scale(20)
    ctx.fillRect(0 - (size/2), 0 - (size/2), size, size)
    size = Scale(10)
    ctx.fillRect(0 - (size/2), Scale(10), size, size)
    ctx.resetTransform();

    ctx.font = Scale(32)+"px NafteraBoldItalic";
    ctx.fillText(fps + " FPS", Scale(10), Scale(30));

    ctx.fillStyle = "rgba(255,0,0,"+TheGame.Constants.HurtRed/255+")"
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = "rgba(0,255,0,"+TheGame.Constants.HealGreen/255+")"
    ctx.fillRect(0, 0, w, h)
    if (!TheGame.Constants.GameOver){
        if (!TheGame.Constants.Started){
            ctx.save();
            ctx.translate(w/2, h*0.7);
            let rot = Math.sin(time/720) * Math.PI /50
            ctx.rotate(rot);
            ctx.fillStyle = "white"
            ctx.font = Scale(40)+"px NafteraBoldItalic";
            ctx.textAlign = "center"
            ctx.textBaseline = "middle";
            ctx.fillText("Press anywhere to start", 0, 0);
            ctx.restore()
        }else{
            ctx.save();
            ctx.translate(w/2, h*0.8);
            let rot = Math.sin(time/720) * Math.PI /50
            ctx.rotate(rot);
            ctx.textAlign = "center"
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(100,255,100,1)"
            ctx.font = Scale(20)+"px NafteraBoldItalic";
            ctx.fillText("Score: "+TheGame.Player.Score, 0, 0);
            ctx.fillStyle = "rgba(255,100,100,1)"
            ctx.fillText("Health: "+TheGame.Player.Health, 0, Scale(20));
            ctx.restore();
        }
    }else{
        ctx.save();
        ctx.translate(w/2, h/2);
        let rot = Math.sin(time/720) * Math.PI /50
        ctx.rotate(rot);
        ctx.fillStyle = "rgba(255,100,100,1)"
        ctx.font = Scale(40)+"px NafteraBoldItalic";
        ctx.textAlign = "center"
        ctx.textBaseline = "middle";
        ctx.lineWidth = Scale(4);
        ctx.strokeStyle = "black"
        ctx.strokeText("You Died!", 0, 0);
        ctx.fillText("You Died!", 0, 0);
        ctx.fillStyle = "rgba(100,255,100,1)"
        ctx.font = Scale(30)+"px NafteraBoldItalic";
        ctx.lineWidth = Scale(4);
        ctx.strokeText("Score: "+TheGame.Player.Score,0, Scale(40));
        ctx.fillText("Score: "+TheGame.Player.Score, 0, Scale(40));
        ctx.fillStyle = "rgba(255,255,255,1)"
        ctx.font = Scale(30)+"px NafteraBoldItalic";
        ctx.lineWidth = Scale(4);
        ctx.strokeText("Press anywhere or reload page to retry",0, Scale(80));
        ctx.fillText("Press anywhere or reload page to retry", 0, Scale(80));
        ctx.restore()
    }
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
