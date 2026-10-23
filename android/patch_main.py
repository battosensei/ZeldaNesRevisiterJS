from pathlib import Path
p=Path('android/app/src/main/assets/www/main.js')
s=p.read_text()
for a,b in {
    './sounds/overworld_edit.mp3':'./sounds/Overworld_edit.mp3',
    './sounds/LOZ_sword_slash.wav':'./sounds/LOZ_Sword_Slash.wav',
    './sounds/LOZ_text_slow.wav':'./sounds/LOZ_Text_Slow.wav',
    './sounds/item.mp3':'./sounds/Item.mp3',
    './sounds/LOZ_shield.wav':'./sounds/LOZ_Shield.wav',
    './sounds/LOZ_link_hurt.wav':'./sounds/LOZ_Link_Hurt.wav',
    './sounds/LOZ_get_rupee.wav':'./sounds/LOZ_Get_Rupee.wav',
    './sounds/LOZ_enemy_die.wav':'./sounds/LOZ_Enemy_Die.wav',
    './sounds/LOZ_enemy_hit.wav':'./sounds/LOZ_Enemy_Hit.wav',
}.items():
    s=s.replace(a,b)
kd='function keyDownHandler(e){'
if 'DungeonNES.handleKeyDown' not in s:
    s=s.replace(kd, kd+'\n\tif(window.DungeonNES && DungeonNES.handleKeyDown(e)){ e.preventDefault(); return; }',1)
ku='function keyUpHandler(e){'
if 'DungeonNES.handleKeyUp' not in s:
    s=s.replace(ku, ku+'\n\tif(window.DungeonNES && DungeonNES.handleKeyUp(e)){ e.preventDefault(); return; }',1)
needle='\t\telse\n\t\t{\n\t\t\tinvincibleTime--;'
insert='\t\telse\n\t\t{\n\t\t\tif(window.DungeonNES && DungeonNES.state.active)\n\t\t\t{\n\t\t\t\tDungeonNES.updateAndDraw(ctx);\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tif(window.DungeonNES && DungeonNES.maybeEnterFromOverworld(currentMap, linkX, linkY))\n\t\t\t{\n\t\t\t\tDungeonNES.updateAndDraw(ctx);\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tinvincibleTime--;'
if 'DungeonNES.maybeEnterFromOverworld' not in s:
    if needle not in s:
        raise SystemExit('main.js game-loop patch point not found')
    s=s.replace(needle,insert,1)
p.write_text(s)
