import { Container, Sprite, Text, Texture } from 'pixi.js';
import * as PIXI from "pixi.js";
import gsap from 'gsap';
import { i18n } from '../utils/i18n';
import { Cauldron } from '../ui/Cauldron';
import { PixiLogo } from '../ui/PixiLogo';
import { SmokeCloud } from '../ui/SmokeCloud';
import { app } from '../main';
import { navigation } from '../utils/navigation';
import { GameTimer } from '../ui/GameTimer';
import { Label } from '../ui/Label';
import { GameScreen } from './GameScreen';

const current = new Date().getTime()
/** Screen shown while loading assets */
export class LoadScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['preload'];
    /** ANimated cauldron */
    private cauldron: Cauldron;
    /** The PixiJS logo */
    private pixiLogo: PixiLogo;
    /** The cloud animation at the top */
    private cloud: SmokeCloud;
    /** LThe loading message display */
    private message: Text;
    private bg: Sprite;
    private progressBg: Sprite;
    private progressBar: Sprite;
    private car: Sprite;
    private time: Label;
    
    constructor() {
        super();
        this.time = new Label(5,{
            fill:'0xffffff',
            fontSize:'64px'
        })
        this.time.zIndex = 10
        // this.addChild(this.time)
        this.car = new Sprite({
            texture: Texture.from('car'),
        });
       
        const timer = setInterval(async()=>{
            // console.log(new Date().getTime(),'现在时间')
            const arr = [{differ:1000,num:1},{differ:2000,num:2},{differ:3000,num:3},{differ:4000,num:4},{differ:5000,num:5}].reverse()
            const differ = new Date().getTime() - current
            this.progressBar.width = window.innerWidth* 0.000156*(differ)
            this.car.x = window.innerWidth * 0.000156*(differ) - 5
            // await navigation.showScreen(LoadScreen);
            // this.time.x = window.innerWidth*0.5
            // this.time.y = window.innerHeight*0.2
            // this.time.zIndex = 10
            // this.removeChild(this.time)
            // this.addChild(this.time)
            if((differ) > 5000) {
                // 5 秒倒计时到了
                clearInterval(timer)
                console.log('倒计时结束')
                // window.location.search = ''
                await navigation.showScreen(GameScreen);
            }
        },10)
       
        this.progressBar = new Sprite({
            texture: Texture.from('progress-bar'),
        });
        this.progressBg = new Sprite({
            texture: Texture.from('progress-bg'),
        });
        this.progressBg.zIndex = 10
        this.progressBar.zIndex = 11
        this.car.zIndex = 12
        this.bg = new Sprite({
            texture: Texture.from('preload-bg'),
        });
        this.addChild(this.car);
        this.addChild(this.progressBar);
        this.addChild(this.progressBg);
        this.addChild(this.bg);
        this.cauldron = new Cauldron();
        // this.addChild(this.cauldron);
        this.message = new Text({
            text: i18n.loadingMessage,
            style: {
                fill: 0xffffff,
                fontFamily: 'Verdana',
                align: 'center',
            },
        });
        this.message.anchor.set(0.5);
        this.addChild(this.message);

        this.pixiLogo = new PixiLogo();
        // this.addChild(this.pixiLogo);

        this.cloud = new SmokeCloud();
        this.cloud.height = 100;
        // this.addChild(this.cloud);
    }

    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        this.cauldron.x = width * 0.5;
        this.cauldron.y = height * 0.5;
        this.message.x = width * 0.5;
        this.message.y = height * 0.35;
        this.pixiLogo.x = width * 0.5;
        this.pixiLogo.y = height - 50;
        this.cloud.y = 0;
        this.cloud.width = width;
        this.bg.width = width;
        this.bg.height = height;
        this.progressBg.x = width * 0.1;
        this.progressBg.y = height * 0.3;
        this.progressBg.width = width* 0.8
        this.progressBg.height = height*0.021
        this.progressBar.x = width * 0.11;
        this.progressBar.y = height * 0.3051;
        this.progressBar.width = width* 0.77
        this.progressBar.height = height*0.0118

        this.car.x = width * 0.08
        this.car.y = height * 0.29
        this.car.width = width * 0.182
        this.car.height = width * 0.1093

        this.time.x = width*0.5
        this.time.y = height*0.2
        
    }

    /** Show screen with animations */
    public async show() {
        gsap.killTweensOf(this.message);
        this.message.alpha = 1;
    }

    /** Hide screen with animations */
    public async hide() {
        // Change then hide the loading message
        this.message.text = i18n.loadingDone;
        gsap.killTweensOf(this.message);
        gsap.to(this.message, {
            alpha: 0,
            duration: 0.3,
            ease: 'linear',
            delay: 0.5,
        });

        // Make the cloud cover the entire screen in a flat colour
        gsap.killTweensOf(this.cloud);
        await gsap.to(this.cloud, {
            height: app.renderer.height,
            duration: 1,
            ease: 'quad.in',
            delay: 0.5,
        });
    }
}
