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
    
    // Definir background: imagem do DALL-E ou gradiente padrão
    const backgroundStyle = slide.backgroundUrl 
      ? `background-image: url('${slide.backgroundUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;`
      : `background: linear-gradient(135deg, ${brandConfig.primaryColor} 0%, ${brandConfig.secondaryColor} 100%);`
    
    if (isFirstSlide) {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    ${backgroundStyle}
    position: relative;
    font-family: '${brandConfig.fontFamily}', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
  ">
    <!-- Background Overlay for better text readability -->
    ${slide.backgroundUrl ? `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.75));
      backdrop-filter: blur(2px);
      z-index: 1;
    "></div>
    ` : ''}
    
    <!-- Content Container -->
    <div style="position: relative; z-index: 2; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
    <!-- Logo -->
    ${brandConfig.logoUrl ? `
    <div style="position: absolute; top: 60px; left: 60px;">
      <img src="${brandConfig.logoUrl}" style="height: 80px; object-fit: contain;" />
    </div>
    ` : ''}
    
    <!-- Main Content -->
    <div style="max-width: 800px; padding: 0 60px;">
      <h1 style="
        font-size: 72px; 
        font-weight: 800; 
        margin: 0 0 40px 0; 
        line-height: 1.1;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      ">${slide.title}</h1>
      
      <p style="
        font-size: 36px; 
        margin: 0; 
        opacity: 0.9;
        font-weight: 600;
      ">${slide.subtitle}</p>
    </div>
    
    <!-- Footer -->
    <div style="
      position: absolute; 
      bottom: 60px; 
      right: 60px; 
      text-align: right;
    ">
      <p style="font-size: 28px; margin: 0; font-weight: 600;">${brandConfig.agencyName}</p>
      <p style="font-size: 22px; margin: 8px 0 0 0; opacity: 0.8;">${brandConfig.contactInfo}</p>
    </div>
    
    <!-- Slide Counter -->
    <div style="
      position: absolute; 
      bottom: 60px; 
      left: 60px; 
      color: white; 
      opacity: 0.7;
    ">
      <span style="font-size: 20px; font-weight: 600;">${index + 1}/${slides.length}</span>
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    ${backgroundStyle}
    position: relative;
    font-family: '${brandConfig.fontFamily}', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
  ">
    <!-- Background Overlay for better text readability -->
    ${slide.backgroundUrl ? `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(3px);
      z-index: 1;
    "></div>
    ` : ''}
    
    <!-- Content Container -->
    <div style="position: relative; z-index: 2; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
    <!-- Logo -->
    ${brandConfig.logoUrl ? `
    <div style="position: absolute; top: 60px; left: 60px;">
      <img src="${brandConfig.logoUrl}" style="height: 80px; object-fit: contain;" />
    </div>
    ` : ''}
    
    <!-- CTA Content -->
    <div style="max-width: 800px; padding: 0 60px;">
      <h2 style="
        font-size: 64px; 
        font-weight: 800; 
        margin: 0 0 40px 0; 
        line-height: 1.1;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      ">${slide.title}</h2>
      
      <p style="
        font-size: 32px; 
        margin: 0 0 40px 0; 
        opacity: 0.9;
        font-weight: 600;
      ">${slide.content}</p>
      
      <!-- CTA Button -->
      <div style="
        background: rgba(255,255,255,0.2);
        border: 2px solid white;
        border-radius: 50px;
        padding: 20px 60px;
        display: inline-block;
        backdrop-filter: blur(10px);
      ">
        <span style="
          font-size: 28px;
          font-weight: 700;
          color: white;
        ">${slide.ctaText}</span>
      </div>
    </div>
    
    <!-- Contact Info -->
    <div style="
      position: absolute; 
      bottom: 60px; 
      right: 60px; 
      text-align: right;
    ">
      <p style="font-size: 32px; margin: 0; font-weight: 700;">${brandConfig.agencyName}</p>
      <p style="font-size: 24px; margin: 8px 0 0 0; opacity: 0.9; font-weight: 600;">${brandConfig.contactInfo}</p>
    </div>
    
    <!-- Slide Counter -->
    <div style="
      position: absolute; 
      bottom: 60px; 
      left: 60px; 
      color: white; 
      opacity: 0.7;
    ">
      <span style="font-size: 20px; font-weight: 600;">${index + 1}/${slides.length}</span>
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    ${backgroundStyle}
    position: relative;
    font-family: '${brandConfig.fontFamily}', sans-serif;
    color: white;
  ">
    <!-- Background Overlay for better text readability -->
    ${slide.backgroundUrl ? `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(2px);
      z-index: 1;
    "></div>
    ` : ''}
    
    <!-- Content Container -->
    <div style="
      position: relative; 
      z-index: 2; 
      width: 100%; 
      height: 100%; 
      display: flex; 
      flex-direction: column; 
      justify-content: center; 
      align-items: flex-start; 
      padding: 100px 80px; 
      box-sizing: border-box;
    ">
    
    <!-- Tip Number -->
    <div style="
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;
      backdrop-filter: blur(10px);
    ">
      <span style="
        font-size: 48px;
        font-weight: 800;
        color: white;
      ">${index}</span>
    </div>
    
    <!-- Content -->
    <h3 style="
      font-size: 56px; 
      font-weight: 700; 
      margin: 0 0 30px 0; 
      line-height: 1.2;
      max-width: 800px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    ">${slide.title}</h3>
    
    <p style="
      font-size: 32px; 
      margin: 0; 
      opacity: 0.95;
      line-height: 1.4;
      max-width: 800px;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
    ">${slide.content}</p>
    
    </div>
    
    <!-- Agency Logo/Name -->
    <div style="
      position: absolute; 
      top: 60px; 
      right: 60px; 
      text-align: right;
      z-index: 3;
    ">
      ${brandConfig.logoUrl ? `
      <img src="${brandConfig.logoUrl}" style="height: 60px; object-fit: contain; margin-bottom: 10px;" />
      ` : `
      <p style="font-size: 24px; margin: 0; font-weight: 700; color: white;">${brandConfig.agencyName}</p>
      `}
    </div>
    
    <!-- Slide Counter -->
    <div style="
      position: absolute; 
      bottom: 60px; 
      left: 60px; 
      color: white; 
      opacity: 0.8;
      z-index: 3;
    ">
      <span style="font-size: 20px; font-weight: 600;">${index + 1}/${slides.length}</span>
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
  return slides.map((slide, index) => {
    const templates = [
      // Slide 1: Problema/Desafio
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    position: relative;
    font-family: '${brandConfig.fontFamily}', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    padding: 80px;
    box-sizing: border-box;
  ">
    <div style="
      background: rgba(255,255,255,0.1);
      border-radius: 30px;
      padding: 60px;
      backdrop-filter: blur(10px);
      max-width: 800px;
    ">
      <div style="
        background: rgba(255,255,255,0.2);
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 40px;
        display: inline-block;
      ">
        <span style="font-size: 24px; font-weight: 700;">DESAFIO</span>
      </div>
      
      <h1 style="
        font-size: 48px; 
        font-weight: 800; 
        margin: 0 0 30px 0; 
        line-height: 1.2;
      ">${slide.title}</h1>
      
      <p style="
        font-size: 28px; 
        margin: 0; 
        opacity: 0.9;
        line-height: 1.4;
      ">${slide.content}</p>
    </div>
    
    <div style="position: absolute; bottom: 60px; right: 60px;">
      <p style="font-size: 24px; margin: 0; font-weight: 600;">${brandConfig.agencyName}</p>
    </div>
    
    <div style="position: absolute; bottom: 60px; left: 60px;">
      <span style="font-size: 20px; font-weight: 600;">1/4</span>
    </div>
  </div>
</body>
</html>
      `,
      // Slide 2: Solução
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
    position: relative;
    font-family: '${brandConfig.fontFamily}', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    padding: 80px;
    box-sizing: border-box;
  ">
    <div style="
      background: rgba(255,255,255,0.1);
      border-radius: 30px;
      padding: 60px;
      backdrop-filter: blur(10px);
      max-width: 800px;
    ">
      <div style="
        background: rgba(255,255,255,0.2);
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 40px;
        display: inline-block;
      ">
        <span style="font-size: 24px; font-weight: 700;">SOLUÇÃO</span>
      </div>
      
      <h2 style="
        font-size: 48px; 
        font-weight: 800; 
        margin: 0 0 30px 0; 
        line-height: 1.2;
      ">${slide.title}</h2>
      
      <p style="
        font-size: 28px; 
        margin: 0; 
        opacity: 0.9;
        line-height: 1.4;
      ">${slide.content}</p>
    </div>
    
    <div style="position: absolute; bottom: 60px; right: 60px;">
      <p style="font-size: 24px; margin: 0; font-weight: 600;">${brandConfig.agencyName}</p>
    </div>
    
    <div style="position: absolute; bottom: 60px; left: 60px;">
      <span style="font-size: 20px; font-weight: 600;">2/4</span>
    </div>
  </div>
</body>
</html>
      `,
      // Slide 3: Resultados
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
    position: relative;
    font-family: '${brandConfig.fontFamily}', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    padding: 80px;
    box-sizing: border-box;
  ">
    <div style="
      background: rgba(255,255,255,0.1);
      border-radius: 30px;
      padding: 60px;
      backdrop-filter: blur(10px);
      max-width: 800px;
    ">
      <div style="
        background: rgba(255,255,255,0.2);
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 40px;
        display: inline-block;
      ">
        <span style="font-size: 24px; font-weight: 700;">RESULTADOS</span>
      </div>
      
      <h2 style="
        font-size: 48px; 
        font-weight: 800; 
        margin: 0 0 30px 0; 
        line-height: 1.2;
      ">${slide.title}</h2>
      
      <p style="
        font-size: 28px; 
        margin: 0; 
        opacity: 0.9;
        line-height: 1.4;
      ">${slide.content}</p>
    </div>
    
    <div style="position: absolute; bottom: 60px; right: 60px;">
      <p style="font-size: 24px; margin: 0; font-weight: 600;">${brandConfig.agencyName}</p>
    </div>
    
    <div style="position: absolute; bottom: 60px; left: 60px;">
      <span style="font-size: 20px; font-weight: 600;">3/4</span>
    </div>
  </div>
</body>
</html>
      `,
      // Slide 4: CTA
      `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0;">
  <div style="
    width: 1080px; 
    height: 1080px; 
    background: linear-gradient(135deg, ${brandConfig.primaryColor} 0%, ${brandConfig.secondaryColor} 100%);
    position: relative;
    font-family: '${brandConfig.fontFamily}', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    padding: 80px;
    box-sizing: border-box;
  ">
    <div style="max-width: 800px;">
      <h2 style="
        font-size: 64px; 
        font-weight: 800; 
        margin: 0 0 40px 0; 
        line-height: 1.1;
      ">${slide.title}</h2>
      
      <p style="
        font-size: 32px; 
        margin: 0 0 50px 0; 
        opacity: 0.9;
        line-height: 1.4;
      ">${slide.content}</p>
      
      <div style="
        background: rgba(255,255,255,0.2);
        border: 3px solid white;
        border-radius: 50px;
        padding: 25px 80px;
        display: inline-block;
        backdrop-filter: blur(10px);
        margin-bottom: 40px;
      ">
        <span style="font-size: 32px; font-weight: 700;">${slide.ctaText}</span>
      </div>
      
      <p style="
        font-size: 28px; 
        margin: 0; 
        font-weight: 600;
        opacity: 0.9;
      ">${brandConfig.contactInfo}</p>
    </div>
    
    <div style="position: absolute; bottom: 60px; left: 60px;">
      <span style="font-size: 20px; font-weight: 600;">4/4</span>
    </div>
  </div>
</body>
</html>
      `
    ]
    
    return templates[index] || templates[templates.length - 1]
  })
}

export const defaultBrandConfig: BrandConfig = {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  fontFamily: 'Inter',
  contactInfo: '@agencia.digital',
  agencyName: 'Agência Digital'
}
