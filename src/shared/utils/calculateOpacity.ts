const calculateOpacity = (level: string, stages: string): number => {
  const levelNum = Number(level);
  const stagesNum = Number(stages);

  const minOpacity = 0.4;
  const maxOpacity = 1.0;

  if (isNaN(levelNum) || isNaN(stagesNum) || levelNum < 0 || stagesNum <= 0) {
    return minOpacity;
  }

  if (levelNum === stagesNum) {
    return maxOpacity;
  }

  const progress = levelNum / stagesNum;
  const finalOpacity = minOpacity + (maxOpacity - minOpacity) * progress;

  return Math.round(finalOpacity * 100) / 100;
};

export default calculateOpacity;
