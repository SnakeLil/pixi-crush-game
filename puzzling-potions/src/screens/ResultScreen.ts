import { Container, NineSliceSprite, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
import { Label } from '../ui/Label';
import { i18n } from '../utils/i18n';
import { ResultStars } from '../ui/ResultStars';
import { Dragon } from '../ui/Dragon';
import { LargeButton } from '../ui/LargeButton';
import { GameScreen } from './GameScreen';
import { navigation } from '../utils/navigation';
import { CloudLabel } from '../ui/CloudLabel';
import { ResultScore } from '../ui/ResultScore';
import { RippleButton } from '../ui/RippleButton';
import { SettingsPopup } from '../popups/SettingsPopup';
import { bgm, sfx } from '../utils/audio';
import { userSettings } from '../utils/userSettings';
import { waitFor } from '../utils/asyncUtils';
import { MaskTransition } from '../ui/MaskTransition';
import { userStats } from '../utils/userStats';
import { BackHomebtn } from '../ui/Result/BackHomeBtn';
import { GoLotteryBtn } from '../ui/Result/GoLotteryBtn';
import { PlayAgainBtn } from '../ui/Result/PlayAgainBtn';
import { FancyButton } from '@pixi/ui';

const handleBackHome = () => {
    // 点击返回首页
    console.log('返回首页');
};
const handleGoLottery = () => {
    // 点击抽奖
    console.log('去抽奖');
};
const handlePlayAgain = () => {
    // 点击再玩一次
    console.log('再玩一次');
    navigation.showScreen(GameScreen);
};
// 判断页面是在手机端，平板端 打开
export const isPhone = () => {
    let is = false;
    let userAgentInfo;
    if (window && window.navigator) {
        userAgentInfo = navigator?.userAgent;
    }
    const mobileAgents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
    for (let i = 0; i < mobileAgents.length; i++) {
        if (userAgentInfo && userAgentInfo.indexOf(mobileAgents[i]) !== -1) {
            is = true;
        }
    }
    const width = window.innerWidth;
    if (width < 768) {
        is = true;
    }
    return is;
};

/** APpears after gameplay ends, displaying scores and grade */
export class ResultScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ['result', 'common'];
    /** The centered box area containing the results */
    private panel: Container;
    /** Animated dragon */
    private dragon: Dragon;
    /** The panel background */
    private panelBase: Sprite;
    /** The screen title */
    private title: Label;
    /** The current game mode label */
    private mode: Label;
    /** The static white cauldron */
    private cauldron: Sprite;
    /** The performance message, according to grade */
    private message: CloudLabel;
    /** The gameplay final score in current game mode */
    private score: ResultScore;
    /** The best score in current game mode */
    private bestScore: Label;
    /** The animated stars that represent the grade */
    private stars: ResultStars;
    /** The footer base */
    private bottomBase: NineSliceSprite;
    /** Button that goes back to the game to play again */
    private continueButton: LargeButton;
    // 结算页面返回首页按钮
    private backHomeButton: BackHomebtn;
    /** Button that opens the settings panel */
    private settingsButton: RippleButton;
    /** A special transition that temporarely masks the entire screen */
    private maskTransition?: MaskTransition;
    // 参与抽奖按钮
    private goLotteryButton: GoLotteryBtn;
    // 再玩一次按钮
    private playAgainButton: PlayAgainBtn;
    // private bg: Sprite;
    constructor() {
        super();
        // this.bg = new Sprite({
        //     texture: Texture.from('0x776464'),
        // });
        // this.bg.zIndex = 1;
        this.settingsButton = new RippleButton({
            image: 'icon-settings',
            ripple: 'icon-settings-stroke',
        });
        this.settingsButton.onPress.connect(() => navigation.presentPopup(SettingsPopup));
        // this.addChild(this.settingsButton);

        this.dragon = new Dragon();
        this.dragon.playTransition();
        // this.addChild(this.dragon);

        this.panel = new Container();
        this.addChild(this.panel);

        this.panelBase = Sprite.from('result-base');
        this.panelBase.anchor.set(0.5);
        this.panelBase.width = 380;
        this.panelBase.height = 280;
        this.panel.addChild(this.panelBase);

        // 抽奖按钮
        this.goLotteryButton = new GoLotteryBtn({
            btnSrc: 'btn-go-lottery',
        });
        this.panel.addChild(this.goLotteryButton);

        // 再玩一次
        this.playAgainButton = new PlayAgainBtn();
        this.panel.addChild(this.playAgainButton);

        this.title = new Label('', { fill: 0xffffff });
        this.title.y = -160;
        // this.panel.addChild(this.title);

        this.mode = new Label('', { fill: 0xffffff, fontSize: 12 });
        this.mode.y = -140;
        this.mode.alpha = 0.5;
        // this.panel.addChild(this.mode);

        this.cauldron = Sprite.from('white-cauldron');
        this.cauldron.anchor.set(0.5);
        this.cauldron.y = 145;
        // this.panel.addChild(this.cauldron);

        this.message = new CloudLabel({ color: 0xffffff, labelColor: 0x2c136c });
        this.message.y = -95;
        // this.panel.addChild(this.message);

        // 分数
        this.score = new ResultScore();
        this.score.y = -38;
        this.panel.addChild(this.score);
        //游戏机会提示
        const endText = '';
        this.bestScore = new Label(endText, { fill: 0x2da1e3 });
        // const endText = '恭喜您，获得抽奖机会*1'
        // this.bestScore = new Label(endText, { fill: 0x2DA1E3 });
        // this.bestScore.y = -58;
        // this.bestScore.scale.set(0.7);
        // this.panel.addChild(this.bestScore);

        this.stars = new ResultStars();
        this.stars.y = -10;
        // this.panel.addChild(this.stars);

        this.bottomBase = new NineSliceSprite({
            texture: Texture.from('rounded-rectangle'),
            leftWidth: 32,
            topHeight: 32,
            rightWidth: 32,
            bottomHeight: 32,
        });
        this.bottomBase.tint = 0x2c136c;
        this.bottomBase.height = 200;
        // this.addChild(this.bottomBase);

        // 继续游戏按钮
        this.continueButton = new LargeButton({ text: i18n.resultPlay });
        // this.addChild(this.continueButton);
        this.continueButton.onPress.connect(() => navigation.showScreen(GameScreen));
        this.maskTransition = new MaskTransition();
        // 返回首页按钮
        this.backHomeButton = new BackHomebtn({ text: '' });
        this.addChild(this.backHomeButton);
        this.backHomeButton.onPress.connect(handleBackHome);
        this.goLotteryButton.onPress.connect(handleGoLottery);
        this.playAgainButton.onPress.connect(handlePlayAgain);
    }

    /** Prepare the screen just before showing */
    public prepare() {
        this.bottomBase.visible = false;
        this.continueButton.visible = false;
        this.backHomeButton.visible = false;
        this.playAgainButton.visible = false;
        this.goLotteryButton.visible = false;
        this.panel.visible = false;
        this.dragon.visible = false;
        this.score.visible = false;
        this.bestScore.visible = false;
        this.message.hide(false);
        this.stars.hide(false);

        this.title.text = `${i18n.resultTitle}`;
        const mode = userSettings.getGameMode();
        const readableMode = (i18n as any)[mode + 'Mode'];
        this.mode.text = `${readableMode}`;
    }

    /** Resize the screen, fired whenever window size changes */
    public resize(width: number, height: number) {
        this.dragon.x = width * 0.5 + 20;
        this.dragon.y = height * 0.5 - 210;
        this.panel.x = width * 0.5;
        this.panel.y = height * 0.5;
        this.continueButton.x = width * 0.5;
        this.continueButton.y = height - 90;
        this.backHomeButton.x = width * 0.5;
        this.backHomeButton.y = height * 0.5 + 200;

        this.goLotteryButton.x = -80;
        this.goLotteryButton.y = 60;

        this.playAgainButton.x = +80;
        this.playAgainButton.y = 60;

        this.bottomBase.width = width;
        this.bottomBase.y = height - 100;
        this.settingsButton.x = width - 30;
        this.settingsButton.y = 30;
       
    }

    /** Show screen with animations */
    public async show() {
        bgm.play('common/bgm-main.mp3', { volume: 0.5 });
        // GameScreen hide to a flat colour covering the viewport, which gets replaced
        // by this transition, revealing this screen
        this.maskTransition?.playTransitionIn();

        // Wait a little bit before showing all screen components
        await waitFor(0.5);
        const mode = userSettings.getGameMode();
        const performance = userStats.load(mode);
        this.showDragon();
        await this.showPanel();
        this.animateGradeStars(performance.grade);
        await this.animatePoints(performance.score);
        await this.animateGradeMessage(performance.grade);
        this.showBottom();
    }

    /** Hide screen with animations */
    public async hide() {
        this.hideBottom();
        await this.hideDragon();
        await this.hidePanel();
    }

    /** Reveal the animated dragon behind the panel */
    private async showDragon() {
        gsap.killTweensOf(this.dragon.scale);
        gsap.killTweensOf(this.dragon.pivot);
        this.dragon.visible = true;
        this.dragon.scale.set(0);
        this.dragon.pivot.y = -300;
        gsap.to(this.dragon.pivot, {
            y: 0,
            duration: 0.7,
            ease: 'back.out',
            delay: 0.1,
        });
        await gsap.to(this.dragon.scale, {
            x: 1,
            y: 1,
            duration: 0.3,
            ease: 'back.out',
            delay: 0.2,
        });
    }

    /** Hide the animated dragon behind the panel */
    private async hideDragon() {
        gsap.killTweensOf(this.dragon.pivot);
        await gsap.to(this.dragon.pivot, {
            y: -100,
            duration: 0.2,
            ease: 'back.in',
        });
        this.dragon.scale.set(0);
    }

    /** Show the container box panel animated */
    private async showPanel() {
        gsap.killTweensOf(this.panel.scale);
        this.panel.visible = true;
        this.panel.scale.set(0);
        await gsap.to(this.panel.scale, {
            x: 1,
            y: 1,
            duration: 0.4,
            ease: 'back.out',
        });
    }

    /** Hide the container box panel animated */
    private async hidePanel() {
        gsap.killTweensOf(this.panel.scale);
        await gsap.to(this.panel.scale, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'back.in',
        });
    }
    // 显示按钮
    private async showBtn(button: FancyButton) {
        this.bottomBase.visible = true;
        button.visible = true;
        gsap.killTweensOf(this.bottomBase);
        // this.bottomBase.pivot.y = -200;
        gsap.killTweensOf(button.pivot);
        // button.pivot.y = -200;
        gsap.to(this.bottomBase.pivot, {
            y: 0,
            duration: 0.3,
            ease: 'back.out',
            delay: 0.3,
        });

        await gsap.to(button.pivot, {
            y: 0,
            duration: 0.4,
            ease: 'back.out',
            delay: 0.4,
        });
    }
    // 隐藏按钮
    private async hiddenBtn(button: FancyButton | any) {
        gsap.killTweensOf(this.bottomBase);
        gsap.killTweensOf(button.pivot);

        gsap.to(this.bottomBase.pivot, {
            // y: -200,
            duration: 0.3,
            ease: 'back.in',
        });

        await gsap.to(button.pivot, {
            // y: -200,
            duration: 0.4,
            ease: 'back.in',
        });
    }
    /** Show footer items (purple base + playbutton) animated */
    private async showBottom() {
        this.showBtn(this.continueButton);
        this.showBtn(this.backHomeButton);
        this.showBtn(this.playAgainButton);
        this.showBtn(this.goLotteryButton);
    }

    /** Hide footer items (purple base + playbutton) animated */
    private async hideBottom() {
        this.hiddenBtn(this.continueButton);
        this.hiddenBtn(this.backHomeButton);
        this.hiddenBtn(this.playAgainButton);
        this.hiddenBtn(this.goLotteryButton);
    }

    /** Play points and best score animation */
    private async animatePoints(points: number) {
        await this.score.show();
        await this.score.playScore(points);

        if (!points) return;
        // const mode = userSettings.getGameMode();
        // const bestScore = userStats.loadBestScore(mode);
        let endText = '';
        // this.bestScore.show();
        if (points < 400) {
            endText = '很遗憾，没有获得抽奖机会';
            this.bestScore = new Label(endText, { fill: 0x819eb5 });
            this.bestScore.y = 0;
            this.bestScore.scale.set(0.7);
            this.panel.addChild(this.bestScore);
        } else {
            endText = '恭喜您，获得抽奖机会*1';
            this.bestScore = new Label(endText, { fill: 0x2da1e3 });
            this.bestScore.y = 0;
            this.bestScore.scale.set(0.7);
            this.panel.addChild(this.bestScore);
        }
    }

    /** Play grade stars animation */
    private async animateGradeStars(grade: number) {
        await this.stars.show();
        await this.stars.playGrade(grade);
    }

    /** Play grade payoff message */
    private async animateGradeMessage(grade: number) {
        await waitFor(0.1);
        const messages = i18n as Record<string, string>;
        const message = 'grade' + grade;
        this.message.text = messages[message];
        if (grade < 1) {
            sfx.play('common/sfx-incorrect.wav');
        } else {
            sfx.play('common/sfx-special.wav');
        }
        await this.message.show();
    }
}
