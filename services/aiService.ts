
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AspectRatio, ImageFile, AgentConfig, SocialPlatform, GroundingSource } from '../types';

async function callOpenRouter(model: string, messages: any[], response_format?: any) {
  const response = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, response_format })
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "OpenRouter Error");
  return data.choices[0].message.content;
}

// Agent 1: Le Producteur (Orchestrateur Technique)
export const orchestrate = async (
  prompt: string, 
  config: AgentConfig, 
  platform: SocialPlatform,
  productImages?: ImageFile[],
  logo?: ImageFile
): Promise<{enhancedPrompt: string, musicMood: string, recommendedGenre: string}> => {
  const systemPrompt = `PERSONA: ${config.producer.persona}. 
  TARGET PLATFORM: ${platform}.
  Task: Acting as the Executive Producer, analyze the project request.
  Return a JSON object with keys: "enhancedPrompt", "musicMood", "recommendedGenre" (cinematic, urban, lofi, energetic).`;
  
  const userContent: any[] = [{ type: "text", text: prompt }];
  
  if (productImages) {
    productImages.forEach(img => {
      userContent.push({ type: "image_url", image_url: { url: img.base64 } });
    });
  }
  
  if (logo) {
    userContent.push({ type: "image_url", image_url: { url: logo.base64 } });
  }

  try {
    const text = await callOpenRouter(
      config.producer.model || "google/gemini-2.0-pro-exp-02-05:free", 
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      { type: "json_object" }
    );
    return JSON.parse(text);
  } catch (e) {
    console.error("Orchestrate error:", e);
    return { enhancedPrompt: prompt, musicMood: "Neutral cinematic", recommendedGenre: "cinematic" };
  }
};

// Agent 2: Le Scénariste (Storytelling)
export const writeScript = async (
  prompt: string, 
  marketingAnalysis: string, 
  config: AgentConfig,
  image?: ImageFile
): Promise<string> => {
  const systemPrompt = `PERSONA: ${config.screenwriter.persona}. You are a top-tier Hollywood screenwriter specializing in short-form advertising.`;
  const userContent: any[] = [
    { type: "text", text: `Task: Write a cinematic ad script Based on the initial concept: "${prompt}" and the marketing strategy: "${marketingAnalysis}". Include visual cues.` }
  ];

  if (image) {
    userContent.push({ type: "image_url", image_url: { url: image.base64 } });
  }

  return await callOpenRouter(
    config.screenwriter.model || "anthropic/claude-3.5-sonnet", 
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ]
  );
};

// Agent Image: Using OpenRouter (DALL-E 3 or similar)
export const generateArt = async (prompt: string, aspectRatio: AspectRatio, config: AgentConfig): Promise<ImageFile> => {
  const response = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      model: config.artist.model || "openai/dall-e-3", 
      messages: [
        { role: "system", content: config.artist.persona },
        { role: "user", content: `Generate a high-end cinematic key visual for this concept: ${prompt}. Aspect ratio: ${aspectRatio}` }
      ]
    })
  });
  
  const data = await response.json();
  // OpenRouter DALL-E 3 returns a URL or base64 in the content if configured, 
  // but usually it's a specific response. Let's handle a standard fallback.
  
  if (data.choices?.[0]?.message?.content?.includes("http")) {
    const url = data.choices[0].message.content.match(/https?:\/\/[^\s]+/)?.[0];
    if (url) {
      const res = await fetch(url);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      return { file: new File([blob], "asset.png", { type: 'image/png' }), base64 };
    }
  }

  throw new Error("Image generation via OpenRouter failed.");
};

// Agent 2: Marketer
export const marketAnalysis = async (
  image: ImageFile, 
  prompt: string, 
  config: AgentConfig, 
  platform: SocialPlatform,
  productImages?: ImageFile[],
  logo?: ImageFile
): Promise<{copy: string; sources: GroundingSource[]}> => {
  const systemPrompt = `PERSONA: ${config.marketer.persona}. Analyze trends and write high-converting copy.`;
  const userContent: any[] = [
    { type: "text", text: `Project Concept: "${prompt}". Target Platform: ${platform}. Analyze current digital marketing trends and write the final ad copy.` },
    { type: "image_url", image_url: { url: image.base64 } }
  ];

  if (productImages) {
    productImages.forEach(img => userContent.push({ type: "image_url", image_url: { url: img.base64 } }));
  }

  const copy = await callOpenRouter(
    config.marketer.model || "google/gemini-2.0-pro-exp-02-05:free", 
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ]
  );

  return { copy, sources: [] };
};

// Agent 3: Director (Video)
export const generateCampaignVideo = async (
  image: ImageFile, 
  marketingCopy: string, 
  aspectRatio: AspectRatio,
  platform: SocialPlatform,
  config: AgentConfig,
  musicMood: string
): Promise<{url: string; video: any}> => {
  const systemPrompt = `PERSONA: ${config.director.persona}. You are responsible for directing the final video production, ensuring perfect synergy between the narrative, the visuals, and the music mood.`;
  
  const userPrompt = `Task: Create a detailed motion and visual direction prompt for video generation.
  Base the visual style on this script/copy: "${marketingCopy}".
  
  CRITICAL: Sync the visuals with the Music Mood: "${musicMood}".
  If the mood is energetic, describe high-energy camera movements and rapid changes.
  If the mood is cinematic or orchestral, describe sweeping lateral movements and grand scale.
  If the mood is lo-fi or urban, describe handheld-style shaking or gritty atmospheric details.
  
  The output should be a single paragraph of descriptive visual direction.`;

  const text = await callOpenRouter(
    config.director.model || "google/gemini-2.0-pro-exp-02-05:free", 
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  );

  // Fallback to a placeholder or a generic message if video is strictly required but not available via OpenRouter API yet.
  // In a real scenario where OpenRouter supports it, the code would be similar to the image generation fetch.
  
  throw new Error("OpenRouter currently only supports text and image models in their public API. Video generation models like Sora or Veo are not yet available via the OpenRouter chat completion standard endpoint.");
};

