export interface SlideContent {
  title?: string
  subtitle?: string
  content?: string
  ctaText?: string
  slideNumber?: number
  totalSlides?: number
  backgroundUrl?: string // URL da imagem gerada pelo DALL-E
}

export interface BrandConfig {
  primaryColor: string
  secondaryColor: string
  logoUrl?: string
  fontFamily: string
  contactInfo: string
  agencyName: string
  useAIBackgrounds?: boolean
  backgroundStyle?: 'professional' | 'modern' | 'colorful' | 'minimalist'
}

export function generateBusinessTipsTemplate(
  slides: SlideContent[], 
  brandConfig: BrandConfig
): string[] {
  return slides.map((slide, index) => {
    const isFirstSlide = index === 0
    const isLastSlide = index === slides.length - 1
    
    // Gradientes premium baseados no background style
    const gradientThemes = {
      professional: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      modern: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      colorful: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      minimalist: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
    
    const backgroundGradient = gradientThemes[brandConfig.backgroundStyle || 'professional']
    
    // Definir background: imagem do DALL-E ou gradiente premium
    const backgroundStyle = slide.backgroundUrl 
      ? `background-image: url('${slide.backgroundUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
      : `background: ${backgroundGradient};`
    
    if (isFirstSlide) {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    ${backgroundStyle}
    position: relative;
    font-family: 'Poppins', sans-serif;
    overflow: hidden;
  ">
    <!-- Premium Background Overlay -->
    ${slide.backgroundUrl ? `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%);
      z-index: 1;
    "></div>
    ` : `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      z-index: 1;
    "></div>
    `}
    
    <!-- Geometric Elements -->
    <div style="
      position: absolute;
      top: -100px;
      right: -100px;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      z-index: 2;
    "></div>
    
    <div style="
      position: absolute;
      bottom: -150px;
      left: -150px;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
      z-index: 2;
    "></div>
    
    <!-- Content Container -->
    <div style="
      position: relative; 
      z-index: 10; 
      width: 100%; 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      align-items: center; 
      text-align: center;
      padding: 80px;
      box-sizing: border-box;
    ">
    
    <!-- Premium Header Badge -->
    <div style="
      background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 50px;
      padding: 16px 32px;
      margin-bottom: 40px;
      backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    ">
      <span style="
        font-size: 18px;
        font-weight: 700;
        color: white;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">✨ GUIA EXCLUSIVO</span>
    </div>
    
    <!-- Main Title -->
    <h1 style="
      font-size: 82px; 
      font-weight: 900; 
      margin: 0 0 30px 0; 
      line-height: 0.9;
      color: white;
      text-shadow: 0 6px 20px rgba(0,0,0,0.4);
      max-width: 900px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-align: center;
    ">${slide.title}</h1>
    
    <!-- Subtitle -->
    <p style="
      font-size: 32px; 
      margin: 0 0 60px 0; 
      color: rgba(255,255,255,0.95);
      font-weight: 600;
      max-width: 750px;
      line-height: 1.3;
      text-shadow: 0 3px 10px rgba(0,0,0,0.3);
    ">${slide.subtitle}</p>
    
    <!-- Premium Separator -->
    <div style="
      width: 140px;
      height: 5px;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%);
      border-radius: 3px;
      margin-bottom: 50px;
      box-shadow: 0 2px 10px rgba(255,255,255,0.2);
    "></div>
    
    <!-- Author Info -->
    <div style="
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%);
      border-radius: 25px;
      padding: 30px 50px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.3);
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    ">
      <p style="
        font-size: 26px; 
        margin: 0 0 8px 0; 
        color: white;
        font-weight: 800;
      ">${brandConfig.agencyName}</p>
      <p style="
        font-size: 20px; 
        margin: 0; 
        color: rgba(255,255,255,0.85);
        font-weight: 600;
      ">${brandConfig.contactInfo}</p>
    </div>
    </div>
    
    <!-- Premium Slide Counter -->
    <div style="
      position: absolute; 
      bottom: 50px; 
      left: 50px; 
      background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
      border-radius: 30px;
      padding: 16px 24px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 10;
    ">
      <span style="
        font-size: 18px; 
        font-weight: 700;
        color: white;
      ">${index + 1} / ${slides.length}</span>
    </div>
  </div>
</body>
</html>
      `
    } else if (isLastSlide) {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    ${backgroundStyle}
    position: relative;
    font-family: 'Poppins', sans-serif;
    overflow: hidden;
  ">
    <!-- Premium Background Overlay -->
    ${slide.backgroundUrl ? `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%);
      z-index: 1;
    "></div>
    ` : ''}
    
    <!-- Animated Particles -->
    <div style="
      position: absolute;
      top: 15%;
      left: 8%;
      width: 12px;
      height: 12px;
      background: rgba(255,255,255,0.6);
      border-radius: 50%;
      z-index: 2;
      box-shadow: 0 0 20px rgba(255,255,255,0.4);
    "></div>
    
    <div style="
      position: absolute;
      top: 70%;
      right: 12%;
      width: 16px;
      height: 16px;
      background: rgba(255,255,255,0.4);
      border-radius: 50%;
      z-index: 2;
    "></div>
    
    <div style="
      position: absolute;
      bottom: 30%;
      left: 15%;
      width: 10px;
      height: 10px;
      background: rgba(255,255,255,0.5);
      border-radius: 50%;
      z-index: 2;
    "></div>
    
    <!-- Content Container -->
    <div style="
      position: relative; 
      z-index: 10; 
      width: 100%; 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      align-items: center; 
      text-align: center;
      padding: 80px;
      box-sizing: border-box;
    ">
    
    <!-- CTA Title -->
    <h2 style="
      font-size: 72px; 
      font-weight: 900; 
      margin: 0 0 40px 0; 
      line-height: 1.0;
      color: white;
      text-shadow: 0 6px 25px rgba(0,0,0,0.5);
      max-width: 850px;
    ">${slide.title}</h2>
    
    <!-- CTA Description -->
    <p style="
      font-size: 28px; 
      margin: 0 0 70px 0; 
      color: rgba(255,255,255,0.9);
      font-weight: 600;
      max-width: 750px;
      line-height: 1.4;
      text-shadow: 0 3px 15px rgba(0,0,0,0.3);
    ">${slide.content}</p>
    
    <!-- Premium CTA Button -->
    <div style="
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%);
      border-radius: 70px;
      padding: 32px 70px;
      margin-bottom: 60px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        transition: all 0.5s ease;
      "></div>
      <span style="
        font-size: 26px;
        font-weight: 800;
        color: #2d3748;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        z-index: 1;
      ">${slide.ctaText || '🚀 COMEÇAR AGORA'}</span>
    </div>
    
    <!-- Contact Information -->
    <div style="
      background: linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%);
      border-radius: 30px;
      padding: 35px 60px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
    ">
      <p style="
        font-size: 30px; 
        margin: 0 0 12px 0; 
        color: white;
        font-weight: 800;
      ">${brandConfig.agencyName}</p>
      <p style="
        font-size: 24px; 
        margin: 0; 
        color: rgba(255,255,255,0.85);
        font-weight: 600;
      ">${brandConfig.contactInfo}</p>
    </div>
    </div>
    
    <!-- Premium Slide Counter -->
    <div style="
      position: absolute; 
      bottom: 50px; 
      left: 50px; 
      background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
      border-radius: 30px;
      padding: 16px 24px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 10;
    ">
      <span style="
        font-size: 18px; 
        font-weight: 700;
        color: white;
      ">${index + 1} / ${slides.length}</span>
    </div>
  </div>
</body>
</html>
      `
    } else {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    ${backgroundStyle}
    position: relative;
    font-family: 'Poppins', sans-serif;
    overflow: hidden;
  ">
    <!-- Premium Background Overlay -->
    ${slide.backgroundUrl ? `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%);
      z-index: 1;
    "></div>
    ` : ''}
    
    <!-- Dynamic Geometric Elements -->
    <div style="
      position: absolute;
      top: 0;
      right: 0;
      width: 450px;
      height: 450px;
      background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
      clip-path: polygon(100% 0%, 0% 100%, 100% 100%);
      z-index: 2;
    "></div>
    
    <div style="
      position: absolute;
      bottom: 0;
      left: 0;
      width: 300px;
      height: 300px;
      background: linear-gradient(45deg, rgba(255,255,255,0.08) 0%, transparent 50%);
      clip-path: polygon(0% 100%, 100% 0%, 0% 0%);
      z-index: 2;
    "></div>
    
    <!-- Content Container -->
    <div style="
      position: relative; 
      z-index: 10; 
      width: 100%; 
      height: 100%; 
      padding: 90px; 
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
    ">
    
    <!-- Premium Tip Number -->
    <div style="
      width: 160px;
      height: 160px;
      background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%);
      border: 3px solid rgba(255,255,255,0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 60px;
      backdrop-filter: blur(25px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1));
        z-index: -1;
      "></div>
      <span style="
        font-size: 64px;
        font-weight: 900;
        color: white;
        text-shadow: 0 4px 15px rgba(0,0,0,0.4);
      ">${index}</span>
    </div>
    
    <!-- Title -->
    <h3 style="
      font-size: 64px; 
      font-weight: 800; 
      margin: 0 0 35px 0; 
      line-height: 1.0;
      max-width: 850px;
      color: white;
      text-shadow: 0 6px 25px rgba(0,0,0,0.5);
    ">${slide.title}</h3>
    
    <!-- Content -->
    <p style="
      font-size: 30px; 
      margin: 0; 
      color: rgba(255,255,255,0.9);
      line-height: 1.4;
      max-width: 800px;
      font-weight: 500;
      text-shadow: 0 3px 15px rgba(0,0,0,0.4);
    ">${slide.content}</p>
    
    <!-- Decorative Element -->
    <div style="
      margin-top: 50px;
      width: 100px;
      height: 6px;
      background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%);
      border-radius: 3px;
      box-shadow: 0 2px 10px rgba(255,255,255,0.3);
    "></div>
    </div>
    
    <!-- Agency Branding -->
    <div style="
      position: absolute; 
      top: 60px; 
      right: 60px; 
      text-align: right;
      z-index: 10;
      background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%);
      border-radius: 20px;
      padding: 24px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.1);
    ">
      ${brandConfig.logoUrl ? `
      <img src="${brandConfig.logoUrl}" style="height: 70px; object-fit: contain; margin-bottom: 12px;" />
      ` : `
      <p style="font-size: 26px; margin: 0; font-weight: 800; color: white;">${brandConfig.agencyName}</p>
      `}
    </div>
    
    <!-- Premium Slide Counter -->
    <div style="
      position: absolute; 
      bottom: 60px; 
      left: 60px; 
      background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
      border-radius: 30px;
      padding: 16px 24px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 10;
    ">
      <span style="
        font-size: 18px; 
        font-weight: 700;
        color: white;
      ">${index + 1} / ${slides.length}</span>
    </div>
  </div>
</body>
</html>
      `
    }
  })
}

export function generateClientResultsTemplate(
  slides: SlideContent[], 
  brandConfig: BrandConfig
): string[] {
  const colorSchemes = [
    'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', // Problema
    'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', // Solução
    'linear-gradient(135deg, #00b894 0%, #00a085 100%)', // Resultados
    `linear-gradient(135deg, ${brandConfig.primaryColor} 0%, ${brandConfig.secondaryColor} 100%)` // CTA
  ]
  
  const badges = ['🚫 DESAFIO', '💡 SOLUÇÃO', '📈 RESULTADOS', '🎯 AÇÃO']
  
  return slides.map((slide, index) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    background: ${colorSchemes[index] || colorSchemes[colorSchemes.length - 1]};
    position: relative;
    font-family: 'Poppins', sans-serif;
    overflow: hidden;
  ">
    <!-- Premium Background Effects -->
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      z-index: 1;
    "></div>
    
    <div style="
      position: absolute;
      top: -200px;
      right: -200px;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
      z-index: 2;
    "></div>
    
    <!-- Content Container -->
    <div style="
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 90px;
      box-sizing: border-box;
    ">
      <!-- Main Card -->
      <div style="
        background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
        border-radius: 40px;
        padding: 70px;
        backdrop-filter: blur(20px);
        max-width: 850px;
        border: 2px solid rgba(255,255,255,0.3);
        box-shadow: 0 25px 50px rgba(0,0,0,0.1);
      ">
        <!-- Badge -->
        <div style="
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%);
          border-radius: 25px;
          padding: 18px 36px;
          margin-bottom: 50px;
          display: inline-block;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.4);
        ">
          <span style="
            font-size: 22px; 
            font-weight: 800;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">${badges[index] || badges[badges.length - 1]}</span>
        </div>
        
        <!-- Title -->
        <h1 style="
          font-size: 54px; 
          font-weight: 900; 
          margin: 0 0 35px 0; 
          line-height: 1.1;
          color: white;
          text-shadow: 0 4px 20px rgba(0,0,0,0.4);
        ">${slide.title}</h1>
        
        <!-- Content -->
        <p style="
          font-size: 30px; 
          margin: 0; 
          color: rgba(255,255,255,0.95);
          line-height: 1.4;
          font-weight: 500;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        ">${slide.content}</p>
        
        ${index === slides.length - 1 ? `
        <!-- CTA Button for last slide -->
        <div style="
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
          border-radius: 60px;
          padding: 24px 60px;
          margin-top: 50px;
          display: inline-block;
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
          border: 2px solid rgba(255,255,255,0.3);
        ">
          <span style="
            font-size: 24px;
            font-weight: 800;
            color: #2d3748;
            text-transform: uppercase;
          ">${slide.ctaText || '💬 FALE CONOSCO'}</span>
        </div>
        
        <p style="
          font-size: 26px; 
          margin: 30px 0 0 0; 
          color: white;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">${brandConfig.contactInfo}</p>
        ` : ''}
      </div>
    </div>
    
    <!-- Agency Branding -->
    <div style="
      position: absolute; 
      bottom: 70px; 
      right: 70px; 
      text-align: right;
      z-index: 10;
    ">
      <p style="
        font-size: 26px; 
        margin: 0; 
        font-weight: 800; 
        color: white;
        text-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ">${brandConfig.agencyName}</p>
    </div>
    
    <!-- Slide Counter -->
    <div style="
      position: absolute; 
      bottom: 70px; 
      left: 70px; 
      background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%);
      border-radius: 25px;
      padding: 16px 24px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.2);
      z-index: 10;
    ">
      <span style="
        font-size: 18px; 
        font-weight: 700;
        color: white;
      ">${index + 1} / ${slides.length}</span>
    </div>
  </div>
</body>
</html>
    `
  })
}

export const defaultBrandConfig: BrandConfig = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  fontFamily: 'Poppins',
  contactInfo: '@agencia.digital',
  agencyName: 'Agência Digital',
  backgroundStyle: 'professional'
}
