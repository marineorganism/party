function* say(name,chip,text)
{
  state.buildTextbox(name,text,chip);
  yield;
}
function* speak(mood,text)
{
  state.buildTextbox(caller.properties.name,text,caller.properties.name+"_"+mood);
  yield;
}
function* read(book,bookName,bookChip)
{
  var content = ctx.state.tilemap.properties[book].split("-");
  for (var i = 0;i < content.length;i++)
  {
    yield* say(bookName,bookChip,content[i].trim());
  }
}
class Periodic
{
  constructor(period,callback)
  {
    this.period = period;
    this.callback = callback;
    this.time = this.period;
  }
  update(elapsed)
  {
    this.time += elapsed;
    if (this.time >= this.period)
    {
      while (this.time >= this.period) this.time -= this.period;
      this.callback();
    }
  }
}
function getX() {return caller.body.x + caller.body.width / 2}
function getY() {return caller.y}
function getAngleToPlayer()
{
  return Math.atan2(state.player.y - getY(),state.player.x - getX());
}
function close(value,target,margin)
{
  return (value >= target - margin && value <= target + margin);
}
function* wait(time)
{
  var elapsed = 0;
  while (elapsed < time)
  {
    elapsed += yield;
  }
  return elapsed - time;
}
function* waitAnimation(name)
{
  caller.animations.play(name);
  while (!caller.animations.currentAnim.isFinished) yield;
}
function* waitEffect(x,y,name,nFrames,framerate)
{
  var effect = state.addEffect(x,y,name,nFrames,framerate);
  while (effect.alive) yield;
}
function* waitMove(x,y)
{
  while (true)
  {
    var angle = Math.atan2(y - getY(),x - getX());
    caller.body.velocity.x = Math.cos(angle) * caller.properties.moveSpeed;
    caller.body.velocity.y = Math.sin(angle) * caller.properties.moveSpeed;
    yield* wait(50);
    if (close(getX(),x,caller.body.velocity.x) && close(getY(),y,caller.body.velocity.y)) return;
  }
}
function* waitRandomMove(time)
{
  var angle = Math.random() * Math.PI * 2 - Math.PI;
  caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
  caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
  yield* wait(time);
}
function* waitMoveNearPosition(time,x,y,maxDistance)
{
  var distance = Math.cos(Math.atan2(getY() - y,getX() - x)) * (getX() - x);
  if (distance < maxDistance)
  {
    var angle = Math.random() * Math.PI * 2 - Math.PI;
    caller.body.velocity.x = Math.sin(angle) * caller.properties.moveSpeed;
    caller.body.velocity.y = Math.cos(angle) * caller.properties.moveSpeed;
    yield* wait(time);
  }
  else
  {
    yield* waitMove(x,y);
  }
}
function* waitMoveToRegion(region)
{
  var region = state.regions[region];
  var x = region.x + region.width / 2;
  var y = region.y + region.height / 2;
  yield* waitMove(x,y);
}
function setSelfSwitch(name,value)
{
  ctx.setSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}
function getSelfSwitch(name)
{
  return ctx.getSwitch(ctx.state.tilemap.key+"-"+ctx.caller.name+"-"+name,value);
}
function compareArrays(a,b)
{
  if (a.length != b.length) return false;
  for (var i = 0 ;i < a.length;i++) if (a[i] != b[i]) return false;
  return true;
}
var bullets = state.createBulletGroup(caller,500,40,'bullet2',"shot");
var shooting = new Periodic(60,function()
{
  bullets.fire(getX(),getY(),0,0,caller.angle + (Math.random() / 3 - 1 / 6));
});
while (true)
{
  var elapsed = yield;
  if (input.getButtonState(Button.Strafe))
  {
    caller.strafing = true;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.strafeSpeed;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.strafeSpeed;
  }
  else
  {
    caller.strafing = false;
    caller.body.velocity.x = input.getAxisState(Axis.Horizontal) * caller.properties.moveSpeed;
    caller.body.velocity.y = input.getAxisState(Axis.Vertical) * caller.properties.moveSpeed;
  }
  if (input.getButtonState(Button.Shoot))
  {
    shooting.update(elapsed);
  }
}
