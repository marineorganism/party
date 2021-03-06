///<reference path="phaser/phaser.d.ts"/>

module Scumbag
{
  export class Game extends Phaser.Game
  {
    constructor()
    {
      //26 x 12.8 tiles
      super(832,410,Phaser.AUTO,'content',null,false,false);

      this.state.add('Boot',Boot,false);
      this.state.add('Preloader',Preloader,false);
      this.state.add('MainMenu',MainMenu,false);
      this.state.add('Overworld',Overworld,false);
      this.state.add('Gameover',Gameover,false);
      this.state.add('Credits',Credits,false);

      this.state.start('Boot');
    }
  }
}
