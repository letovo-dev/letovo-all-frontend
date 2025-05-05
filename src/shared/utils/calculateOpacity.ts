const calculateOpacity = (level: string, stage: string): number => {
  const levelNum = Number(level);
  const stageNum = Number(stage);

  const minOpacity = 0.1;
  const maxOpacity = 1.0;

  const maxLevel = 1;

  if (isNaN(levelNum) || isNaN(stageNum) || levelNum < 0 || stageNum < 0) {
    return minOpacity;
  }

  if (levelNum === stageNum) {
    return maxOpacity;
  }

  const levelContribution = Math.min(levelNum, maxLevel) / maxLevel;
  const baseOpacity = minOpacity + (maxOpacity - minOpacity) * levelContribution;

  const stageContribution = stageNum > 0 ? stageNum / 10 : 0;
  const finalOpacity = Math.min(baseOpacity + stageContribution * 0.05, maxOpacity);

  return Math.round(finalOpacity * 100) / 100;
};

export default calculateOpacity;
