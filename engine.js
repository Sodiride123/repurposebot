/* ============================================
   REPURPOSEBOT - Content Generation Engine
   No emoji characters in any generated output
   ============================================ */

// ── Tone Detection ──────────────────────────────────────────────
const TONE_PATTERNS = {
  professional: {
    keywords: ['business','strategy','enterprise','ROI','stakeholder','framework','leverage','optimize','implement','industry','executive','leadership','management','corporate','professional','solution','growth','revenue']
  },
  casual: {
    keywords: ["you're","don't","can't","it's","here's","let's","awesome","cool","super","pretty","just","really","actually","basically","totally","stuff","things","guys","hey"]
  },
  inspirational: {
    keywords: ['dream','passion','inspire','journey','believe','purpose','transform','potential','empower','overcome','success','achieve','vision','mission','legacy','impact','change','growth mindset']
  },
  educational: {
    keywords: ['learn','understand','explain','define','concept','example','research','study','data','evidence','according','shows','demonstrate','discover','knowledge','insight','analysis','findings']
  },
  conversational: {
    keywords: ['think','feel','wonder','imagine','question','ask','curious','interesting','perspective','view','opinion','believe','honestly','frankly','share','tell','story']
  }
};

function detectTone(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [tone, data] of Object.entries(TONE_PATTERNS)) {
    scores[tone] = data.keywords.filter(kw => lower.includes(kw)).length;
  }
  return Object.entries(scores).sort((a,b) => b[1]-a[1])[0][0];
}

// ── Text Analysis ───────────────────────────────────────────────
function analyzeArticle(text) {
  const sentences  = text.match(/[^.!?]+[.!?]+/g) || text.split('\n').filter(l => l.trim().length > 20);
  const words      = text.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);

  const keySentences = extractKeySentences(sentences, 8);
  const keywords     = extractKeywords(text);

  const lines    = text.split('\n').filter(l => l.trim());
  const title    = lines[0].replace(/^#+ /,'').trim() || sentences[0]?.trim() || 'Key Insights';
  const subtitle = lines.find((l,i) => i > 0 && l.trim().length > 30 && l.trim().length < 120) || sentences[1]?.trim() || '';

  const detectedTone = detectTone(text);
  const insights     = extractInsights(paragraphs, sentences, 6);
  const stats        = extractStats(text);
  const quotes       = extractQuotes(text);

  return { title, subtitle, wordCount: words.length, readTime: Math.ceil(words.length/200), sentences, paragraphs, keySentences, keywords, insights, stats, quotes, detectedTone, rawText: text };
}

function extractKeySentences(sentences, count) {
  if (!sentences || sentences.length === 0) return [];
  const allText = sentences.join(' ').toLowerCase();
  const wordFreq = {};
  allText.split(/\s+/).forEach(w => {
    const clean = w.replace(/[^a-z]/g,'');
    if (clean.length > 4) wordFreq[clean] = (wordFreq[clean]||0) + 1;
  });
  const scored = sentences.map((s,i) => {
    let score = 0;
    s.toLowerCase().split(/\s+/).forEach(w => { score += (wordFreq[w.replace(/[^a-z]/g,'')] || 0); });
    if (i === 0) score *= 2;
    if (i === sentences.length-1) score *= 1.5;
    return { text: s.trim(), score, index: i };
  });
  return scored.sort((a,b) => b.score-a.score).slice(0,count).sort((a,b) => a.index-b.index).map(s => s.text);
}

function extractKeywords(text) {
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','may','might','this','that','these','those','it','its','we','you','they','i','he','she','what','which','who','when','where','how','why','not','more','can','also','about','their','our','your','some','all','just','than','then','there','as','if','so','up','out','into','through','each','very']);
  const words = text.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/);
  const freq  = {};
  words.forEach(w => { if (w.length > 4 && !stopWords.has(w)) freq[w] = (freq[w]||0) + 1; });
  return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,15).map(([w]) => w);
}

function extractInsights(paragraphs, sentences, count) {
  const insights = [];
  const seen = new Set();
  const all  = [...(paragraphs||[]), ...(sentences||[])];
  for (const chunk of all) {
    const clean = chunk.trim();
    if (clean.length > 40 && clean.length < 200 && !seen.has(clean)) {
      if (/\b(key|important|critical|must|should|best|top|first|primary|essential|main|core|biggest|major|new|better|improve|increase|decrease|help|enable|allow|create|build|grow)\b/i.test(clean)) {
        insights.push(clean); seen.add(clean);
      }
    }
    if (insights.length >= count) break;
  }
  for (const s of sentences) {
    if (insights.length >= count) break;
    const clean = s.trim();
    if (clean.length > 40 && clean.length < 200 && !seen.has(clean)) { insights.push(clean); seen.add(clean); }
  }
  return insights.slice(0,count);
}

function extractStats(text) {
  const patterns = [
    /\b(\d+(?:\.\d+)?%)\s+(?:of\s+)?([^.]{10,50})/g,
    /\b(\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|thousand|M|B|K))?)\s+([^.]{5,40})/g,
    /(?:more than|over|nearly|about|approximately)\s+(\d+[^\s.,]*[^.]{5,40})/g
  ];
  const stats = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text)) !== null && stats.length < 5) {
      const stat = m[0].trim();
      if (stat.length > 8 && stat.length < 80) stats.push(stat);
    }
  }
  return [...new Set(stats)].slice(0,4);
}

function extractQuotes(text) {
  const quotes = [];
  const re = /"([^"]{30,200})"/g;
  let m;
  while ((m = re.exec(text)) !== null) quotes.push(m[1]);
  return quotes.slice(0,3);
}

// ── LinkedIn Carousel ───────────────────────────────────────────
function generateLinkedInCarousel(analysis, tone) {
  const { title, insights, keywords, keySentences, stats, paragraphs } = analysis;
  const slides = [];

  const toneConfig = {
    professional:  { subtitle: 'The insight every professional needs to know', cta: 'What strategies work for your team? Share below.' },
    casual:        { subtitle: 'What nobody tells you about this', cta: 'What is your take? Drop it below.' },
    inspirational: { subtitle: 'This changed how I think about what matters', cta: 'Share this with someone who needs it.' },
    educational:   { subtitle: 'A complete breakdown of what you need to know', cta: 'Save this post for later.' },
    conversational:{ subtitle: 'A conversation worth having', cta: 'I would love to hear your thoughts.' }
  };
  const tc = toneConfig[tone] || toneConfig.conversational;

  // Cover slide
  slides.push({ type:'cover', slideNum:1, title: title.length>60 ? title.substring(0,57)+'...' : title, subtitle: tc.subtitle });

  // Key point slides
  const points = insights.slice(0,5);
  const pointLabels = ['Point One','Point Two','Point Three','Point Four','Point Five'];
  points.forEach((point, i) => {
    const clean = point.replace(/^[-•*]\s*/,'').trim();
    slides.push({
      type: 'content',
      slideNum: i + 2,
      title: pointLabels[i],
      body: clean.length > 140 ? clean.substring(0,137)+'...' : clean
    });
  });

  // Stats slide
  if (stats.length > 0) {
    slides.push({
      type: 'stat',
      slideNum: slides.length + 1,
      title: 'By The Numbers',
      body: stats.slice(0,2).join('\n\n')
    });
  }

  // CTA slide
  slides.push({ type:'cta', slideNum: slides.length+1, title:'Did this help?', body: tc.cta });

  return slides;
}

// ── Twitter / X Thread ──────────────────────────────────────────
function generateTwitterThread(analysis, tone) {
  const { title, insights, keywords, keySentences, stats } = analysis;
  const tweets = [];

  const toneConfig = {
    professional: {
      hook:    `Thread: ${title}\n\nThis is something every professional should understand.\n\nHere is the full breakdown:`,
      signoff: `That is the full thread.\n\nFollow for more insights like this.\n\nRetweet the first post if this was useful.`
    },
    casual: {
      hook:    `${title}\n\nI just went deep on this topic and the findings are surprising.\n\nHere is everything you need to know:`,
      signoff: `That is a wrap on this one.\n\nIf you found this useful, share it with someone.\n\nFollow for more breakdowns.`
    },
    inspirational: {
      hook:    `${title}\n\nSome ideas stop you in your tracks. This is one of them.\n\nA thread on what really matters:`,
      signoff: `Remember: every big change starts with a single decision to pay attention.\n\nFollow for more content like this.`
    },
    educational: {
      hook:    `${title}\n\nA complete breakdown — ${analysis.readTime > 2 ? `condensed from a ${analysis.readTime}-minute read` : 'everything you need to know'}.\n\nLet us dive in:`,
      signoff: `That is the full breakdown.\n\nBookmark this for future reference.\n\nFollow for more educational threads.`
    },
    conversational: {
      hook:    `Let us talk about: ${title}\n\nI have been thinking about this a lot lately.\n\nHere is my honest take:`,
      signoff: `That is my take on it.\n\nWhat do you think? Reply below.\n\nFollow for more candid conversations.`
    }
  };
  const tc = toneConfig[tone] || toneConfig.conversational;

  // Tweet 1: Hook
  tweets.push({ num:1, text: tc.hook, isHook:true });

  // Tweets 2-7: Key insights
  const points = insights.slice(0, Math.min(6, insights.length));
  points.forEach((point, i) => {
    const clean = point.replace(/^[-•*]\s*/,'').trim();
    const nums  = ['1.','2.','3.','4.','5.','6.'];
    let tweetText = `${nums[i]} ${clean}`;
    if (tweetText.length > 280) tweetText = tweetText.substring(0,277)+'...';
    tweets.push({ num: i+2, text: tweetText });
  });

  // Stats tweet
  if (stats.length > 0) {
    const statTweet = `The numbers:\n\n${stats.slice(0,2).map(s=>`— ${s}`).join('\n\n')}`;
    tweets.push({ num: tweets.length+1, text: statTweet.length>280 ? statTweet.substring(0,277)+'...' : statTweet });
  }

  // Key takeaway
  const topKw  = keywords[0] || 'this topic';
  const taText = `Key takeaway:\n\n${keySentences[0] || insights[0] || title}\n\n${keywords.slice(0,3).map(k=>`#${k}`).join(' ')}`;
  tweets.push({ num: tweets.length+1, text: taText.length>280 ? taText.substring(0,277)+'...' : taText });

  // Sign-off
  tweets.push({ num: tweets.length+1, text: tc.signoff, isSignoff:true });

  return tweets.slice(0,10);
}

// ── Email Newsletter ────────────────────────────────────────────
function generateEmailNewsletter(analysis, tone) {
  const { title, subtitle, insights, keywords, keySentences, stats, quotes, paragraphs, wordCount, readTime } = analysis;

  const subjects = {
    professional:  `Key Insights: ${title}`,
    casual:        `Worth reading: ${title}`,
    inspirational: `A message worth reading today`,
    educational:   `Deep Dive: ${title}`,
    conversational:`My honest thoughts on ${title}`
  };

  const greetings = {
    professional:  'Dear Reader,',
    casual:        'Hey there,',
    inspirational: 'Hello,',
    educational:   'Welcome back,',
    conversational:'Hi friend,'
  };

  const intros = {
    professional:  `In today's fast-moving landscape, staying informed is more critical than ever. We have distilled the key insights from "${title}" so you can act on what matters most.`,
    casual:        `I came across something genuinely interesting and could not keep it to myself. Today we are breaking down "${title}" — and it is packed with useful ideas.`,
    inspirational: `Some content stops you in your tracks. "${title}" is one of those pieces. Today we unpack the ideas that could genuinely shift your perspective.`,
    educational:   `Understanding complex topics does not have to be complicated. Today we break down "${title}" into clear, actionable insights you can apply immediately.`,
    conversational:`I have been thinking a lot about "${title}" lately and wanted to share my thoughts with you. Let us dig into this together.`
  };

  const ctas = {
    professional:  'Schedule time to implement these insights with your team',
    casual:        'Dive deeper into the full article',
    inspirational: 'Start your transformation journey today',
    educational:   'Explore more resources on this topic',
    conversational:'Read the full piece and join the conversation'
  };

  return {
    subject:      subjects[tone]      || subjects.conversational,
    greeting:     greetings[tone]     || greetings.conversational,
    intro:        intros[tone]        || intros.conversational,
    mainInsights: insights.slice(0,4),
    highlight:    quotes[0] || keySentences[0] || insights[0] || '',
    stats,
    keywords:     keywords.slice(0,5),
    cta:          ctas[tone]          || ctas.conversational,
    title
  };
}

// ── Podcast Script ──────────────────────────────────────────────
function generatePodcastScript(analysis, tone) {
  const { title, insights, keywords, keySentences, stats, paragraphs, readTime } = analysis;
  const episodeDuration = Math.max(10, Math.min(25, readTime*2+5));

  const hostStyles = {
    professional: {
      intro:      `Welcome back to the show. Today we are diving into something that has been on a lot of minds lately — ${title}. This episode is packed with actionable insights, so let us get into it.`,
      transition: `Now, let us take this a step further.`,
      signOff:    `That is everything for today's episode. If you found value here, please subscribe and leave a review. Until next time, keep moving forward.`
    },
    casual: {
      intro:      `Hey, welcome back to the pod. Today is a good one — we are talking all about ${title}. Grab your coffee, get comfortable, and let us jump in.`,
      transition: `Okay, here is where it gets really interesting.`,
      signOff:    `That is going to do it for today. Such a great topic. If you liked this episode, hit subscribe and share it with a friend. See you next time.`
    },
    inspirational: {
      intro:      `Welcome, and thank you for being here today. What we are about to explore — ${title} — is not just information. It is a framework for thinking differently and becoming who you are meant to be. Let us begin.`,
      transition: `This brings us to something truly powerful.`,
      signOff:    `Remember: every big change starts with a single decision to pay attention. You made that decision by showing up today. Keep going. Subscribe for more.`
    },
    educational: {
      intro:      `Hello and welcome back. Today we have a deep-dive episode on ${title}. By the end, you will have a complete, working understanding of this topic with real examples you can use. Let us learn.`,
      transition: `Building on that foundation, let us explore the next key concept.`,
      signOff:    `Excellent work making it to the end. You have just leveled up your knowledge on this topic. Subscribe so you do not miss our next deep dive.`
    },
    conversational: {
      intro:      `Hey, welcome back. Glad you are here. Real talk — I have been thinking about ${title} a lot lately and had to discuss it. This is going to be one of those honest, no-filler conversations. Let us get into it.`,
      transition: `And here is the thing that really got me thinking.`,
      signOff:    `That is my honest take on it. I would love to hear what you think — send me a message or leave a comment. Subscribe if you want more conversations like this. See you next episode.`
    }
  };

  const hs = hostStyles[tone] || hostStyles.conversational;
  const segments = [];

  // Intro
  segments.push({ type:'intro', label:'INTRO', duration:'1–2 min', text: hs.intro });

  // Context
  const contextText = paragraphs[0] || keySentences[0] || '';
  if (contextText) {
    segments.push({
      type:      'main',
      label:     'CONTEXT AND BACKGROUND',
      duration:  '2–3 min',
      stageDir:  '[Set the scene — speak conversationally, not reading verbatim]',
      text:      `Let me give you some context. ${contextText.substring(0,300)}${contextText.length>300?'...' : ''} This is the foundation that everything else we discuss today builds on.`
    });
  }

  // Key insights
  insights.slice(0,3).forEach((insight, i) => {
    const labels = ['KEY INSIGHT ONE','KEY INSIGHT TWO','KEY INSIGHT THREE'];
    segments.push({
      type:     'segment',
      label:    labels[i],
      duration: '2–4 min',
      stageDir: '[Pause before this section]',
      text:     `${hs.transition} ${insight} Let me break down why this matters — and how you can actually use this in practice.`
    });
  });

  // Stats
  if (stats.length > 0) {
    segments.push({
      type:     'main',
      label:    'THE DATA',
      duration: '1–2 min',
      stageDir: '[Speak slowly and clearly for statistics]',
      text:     `Now let us look at the numbers, because data tells a story that words sometimes cannot. ${stats.map(s=>`Consider this: ${s}.`).join(' ')} These figures paint a clear picture of what we are really talking about here.`
    });
  }

  // Synthesis
  segments.push({
    type:     'transition',
    label:    'SYNTHESIS',
    duration: '1–2 min',
    stageDir: '[Slow down, become more deliberate in your delivery]',
    text:     `We have covered a lot of ground today. Let me tie it all together. When you step back and look at everything — ${keywords.slice(0,3).join(', ')} — there is one central truth emerging: ${keySentences[keySentences.length-1] || insights[0] || title}.`
  });

  // Outro
  segments.push({ type:'outro', label:'OUTRO AND CALL TO ACTION', duration:'~1 min', text: hs.signOff });

  return { episodeDuration, title: `Episode: ${title}`, segments };
}

// ── Instagram Captions ──────────────────────────────────────────
function generateInstagramCaptions(analysis, tone) {
  const { title, insights, keywords, keySentences, stats } = analysis;
  const topKeywords = keywords.slice(0,8);
  const hashtagBase = topKeywords.map(k => `#${k.replace(/\s+/g,'')}`);
  const genericTags = ['#contentmarketing','#digitalmarketing','#socialmedia','#growthmindset','#learning','#knowledge','#motivation','#insights'];
  const allHashtags  = [...new Set([...hashtagBase,...genericTags])].slice(0,15);

  const firstInsight  = (insights[0] || keySentences[0] || title).replace(/^[-•*]\s*/,'').trim();
  const secondInsight = (insights[1] || keySentences[1] || '').replace(/^[-•*]\s*/,'').trim();
  const lastInsight   = (insights[insights.length-1] || keySentences[keySentences.length-1] || '').replace(/^[-•*]\s*/,'').trim();

  const variants = [];

  // Variant 1: Story hook
  const hookOpeners = {
    professional:  `This insight changes how professionals approach ${topKeywords[0]||'their work'}.`,
    casual:        `This is one of those things that once you see it, you cannot unsee it.`,
    inspirational: `What if the thing holding you back was actually your greatest asset?`,
    educational:   `Most people do not know this about ${topKeywords[0]||'this topic'}.`,
    conversational:`Here is something I have been thinking about a lot lately.`
  };
  variants.push({
    variant: 1,
    style:   'Story-Driven Hook',
    text:    `${hookOpeners[tone]||hookOpeners.conversational}\n\n${firstInsight}\n\n${secondInsight ? `What most people miss:\n\n${secondInsight.substring(0,100)}${secondInsight.length>100?'...':''}` : `This insight from "${title}" is worth sitting with.`}\n\nSave this post if it was useful.\n\n${allHashtags.slice(0,10).join(' ')}`
  });

  // Variant 2: Value list
  const listInsights = insights.slice(0,3).map((ins,i) => {
    const clean = ins.replace(/^[-•*]\s*/,'').trim().substring(0,80);
    return `${i+1}. ${clean}${clean.length>=80?'...':''}`;
  });
  variants.push({
    variant: 2,
    style:   'Value List',
    text:    `Things "${title}" taught me:\n\n${listInsights.join('\n\n')}\n\nWhich one resonates most with you? Comment below.\n\n${allHashtags.slice(0,12).join(' ')}`
  });

  // Variant 3: Thought-provoking question
  const questionOpeners = {
    professional:  `What if your biggest professional challenge was actually your greatest opportunity?`,
    casual:        `Unpopular opinion: ${title} is more important than most people realize.`,
    inspirational: `What if everything you needed to succeed was already inside you?`,
    educational:   `${stats[0] ? `Data point: ${stats[0]}` : `The evidence on "${title}" might surprise you.`}`,
    conversational:`When was the last time you genuinely thought about ${topKeywords[0]||'what matters most'}?`
  };
  variants.push({
    variant: 3,
    style:   'Thought Provocateur',
    text:    `${questionOpeners[tone]||questionOpeners.conversational}\n\n${lastInsight ? `${lastInsight.substring(0,120)}${lastInsight.length>120?'...':''}` : `"${title}" offers some genuinely important answers.`}\n\nDouble-tap if you agree.\n\n${allHashtags.slice(3,15).join(' ')}`
  });

  return variants;
}

// ── Main Orchestrator ───────────────────────────────────────────
function repurposeContent(text, forcedTone=null) {
  const analysis = analyzeArticle(text);
  const tone     = forcedTone || analysis.detectedTone;
  return {
    analysis,
    tone,
    linkedin:  generateLinkedInCarousel(analysis, tone),
    twitter:   generateTwitterThread(analysis, tone),
    email:     generateEmailNewsletter(analysis, tone),
    podcast:   generatePodcastScript(analysis, tone),
    instagram: generateInstagramCaptions(analysis, tone)
  };
}

window.RepurposeEngine = { repurposeContent, analyzeArticle, detectTone };