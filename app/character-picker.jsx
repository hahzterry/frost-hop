'use client';
import { useEffect, useRef } from 'react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { CHARACTERS, drawCharacter } from '../game/characters.mjs';
function Portrait({ character }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,80,72);ctx.imageSmoothingEnabled=true;
    drawCharacter(ctx,character,{grounded:true,vx:0,facing:1},43,27,0,true);
  },[character]);
  return <canvas ref={ref} width={80} height={72} aria-hidden="true"/>;
}
export default function CharacterPicker({ value, onChange }) {
  return <div className="character-picker"><span className="picker-label" id="character-label">KARAKTERİNİ SEÇ</span>
    <RadioGroup value={value} onValueChange={onChange} className="character-options" aria-labelledby="character-label">
      {CHARACTERS.map(c => <label key={c.id} className={`character-option ${value===c.id?'selected':''}`} style={{'--character-color':c.color}}>
        <Portrait character={c.id}/><span className="character-name">{c.name}</span>
        <RadioGroupItem value={c.id} aria-label={`${c.name} — ${c.description}`} className="character-radio"/>
      </label>)}
    </RadioGroup><span className="picker-detail">{CHARACTERS.find(c=>c.id===value)?.description} · Aynı hız, aynı zıplama</span>
  </div>;
}
