import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import logger from '@/utils/logger';
import { aiConfig } from '@/config';

type AIAssistantType = 'TASK_SUGGESTER' | 'MEETING_SUMMARIZER' | 'TIMELINE_GENERATOR' | 'CODE_REVIEWER';

export interface AIRequestInput {
  type: AIAssistantType;
  workspaceId: string;
  userId: string;
  input: string;
  context?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  suggestions: string[];
  metadata?: Record<string, any>;
}

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: aiConfig.openaiApiKey,
    });
  }

  async createRequest(input: AIRequestInput) {
    return prisma.aIRequest.create({
      data: {
        type: input.type as any,
        workspaceId: input.workspaceId,
        userId: input.userId,
        input: input.input,
        context: input.context || {},
      },
    });
  }

  async createResponse(requestId: string, userId: string, response: AIResponse) {
    return prisma.aIResponse.create({
      data: {
        requestId,
        userId,
        content: response.content,
        suggestions: response.suggestions,
        metadata: response.metadata || {},
      },
    });
  }

  async getRequestHistory(workspaceId: string, limit = 50) {
    return prisma.aIRequest.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async suggestTasks(workspaceId: string, context: string): Promise<AIResponse> {
    const prompt = `Based on the following workspace context, suggest 3-5 actionable tasks that would help move the project forward:

Context: ${context}

Please provide:
1. Task suggestions with clear, actionable descriptions
2. Priority levels (LOW, MEDIUM, HIGH, URGENT)
3. Estimated effort (1-2 hours, 3-5 hours, 1-2 days, 1 week+)
4. Any relevant tags or categories

Format as JSON with the following structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "priority": "MEDIUM",
      "effort": "3-5 hours",
      "tags": ["frontend", "bug-fix"]
    }
  ],
  "summary": "Brief summary of suggestions"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: aiConfig.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content || 'No suggestions available';
      const suggestions = this.extractTaskSuggestions(content);

      return {
        content,
        suggestions,
        metadata: { type: 'task_suggestions', count: suggestions.length },
      };
    } catch (error) {
      logger.error('AI task suggestion failed:', error);
      throw new Error('Failed to generate task suggestions');
    }
  }

  async summarizeMeeting(transcript: string, participants: string[]): Promise<AIResponse> {
    const prompt = `Please summarize the following meeting transcript and extract key action items:

Participants: ${participants.join(', ')}

Transcript:
${transcript}

Please provide:
1. Executive summary (2-3 sentences)
2. Key discussion points
3. Action items with assignees (if mentioned)
4. Decisions made
5. Next steps

Format as JSON with the following structure:
{
  "summary": "Brief executive summary",
  "keyPoints": ["Point 1", "Point 2"],
  "actionItems": [
    {
      "task": "Action item description",
      "assignee": "Name or 'TBD'",
      "deadline": "If mentioned or 'TBD'"
    }
  ],
  "decisions": ["Decision 1", "Decision 2"],
  "nextSteps": ["Next step 1", "Next step 2"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: aiConfig.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content || 'Summary unavailable';
      const suggestions = this.extractActionItems(content);

      return {
        content,
        suggestions,
        metadata: { type: 'meeting_summary', participantCount: participants.length },
      };
    } catch (error) {
      logger.error('AI meeting summarization failed:', error);
      throw new Error('Failed to summarize meeting');
    }
  }

  async generateTimeline(projectContext: string, milestones: string[]): Promise<AIResponse> {
    const prompt = `Based on the project context and milestones, generate a realistic timeline:

Project Context: ${projectContext}

Milestones: ${milestones.join(', ')}

Please provide:
1. Timeline breakdown with phases
2. Estimated durations for each phase
3. Dependencies between tasks
4. Critical path identification
5. Risk factors and mitigation strategies

Format as JSON with the following structure:
{
  "phases": [
    {
      "name": "Phase name",
      "duration": "2 weeks",
      "tasks": ["Task 1", "Task 2"],
      "dependencies": ["Previous phase"],
      "risks": ["Risk description"]
    }
  ],
  "criticalPath": ["Phase 1", "Phase 2"],
  "totalDuration": "8 weeks",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: aiConfig.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 1200,
      });

      const content = completion.choices[0]?.message?.content || 'Timeline unavailable';
      const suggestions = this.extractTimelineSuggestions(content);

      return {
        content,
        suggestions,
        metadata: { type: 'timeline', milestoneCount: milestones.length },
      };
    } catch (error) {
      logger.error('AI timeline generation failed:', error);
      throw new Error('Failed to generate timeline');
    }
  }

  async reviewCode(code: string, language: string, context?: string): Promise<AIResponse> {
    const prompt = `Please review the following ${language} code and provide feedback:

${context ? `Context: ${context}\n\n` : ''}Code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. Code quality assessment
2. Potential bugs or issues
3. Performance improvements
4. Security concerns
5. Best practices recommendations
6. Specific suggestions for improvement

Format as JSON with the following structure:
{
  "quality": "GOOD/FAIR/NEEDS_IMPROVEMENT",
  "issues": [
    {
      "type": "bug/performance/security/style",
      "severity": "LOW/MEDIUM/HIGH/CRITICAL",
      "description": "Issue description",
      "suggestion": "How to fix"
    }
  ],
  "improvements": ["Suggestion 1", "Suggestion 2"],
  "overallScore": 8.5,
  "summary": "Brief summary of review"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: aiConfig.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const content = completion.choices[0]?.message?.content || 'Code review unavailable';
      const suggestions = this.extractCodeSuggestions(content);

      return {
        content,
        suggestions,
        metadata: { type: 'code_review', language, codeLength: code.length },
      };
    } catch (error) {
      logger.error('AI code review failed:', error);
      throw new Error('Failed to review code');
    }
  }

  async processAIRequest(input: AIRequestInput): Promise<AIResponse> {
    const request = await this.createRequest(input);
    let response: AIResponse;

    try {
      switch (input.type) {
        case 'TASK_SUGGESTER':
          response = await this.suggestTasks(input.workspaceId, input.input);
          break;
        case 'MEETING_SUMMARIZER':
          const participants = input.context?.participants || [];
          response = await this.summarizeMeeting(input.input, participants);
          break;
        case 'TIMELINE_GENERATOR':
          const milestones = input.context?.milestones || [];
          response = await this.generateTimeline(input.input, milestones);
          break;
        case 'CODE_REVIEWER':
          const language = input.context?.language || 'javascript';
          response = await this.reviewCode(input.input, language, input.context?.context);
          break;
        default:
          throw new Error(`Unsupported AI assistant type: ${input.type}`);
      }

      await this.createResponse(request.id, input.userId, response);
      return response;
    } catch (error) {
      logger.error(`AI request processing failed for type ${input.type}:`, error);
      throw error;
    }
  }

  private extractTaskSuggestions(content: string): string[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.tasks?.map((task: any) => task.title) || [];
      }
    } catch {
      // Fallback to simple extraction
    }
    return content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
  }

  private extractActionItems(content: string): string[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.actionItems?.map((item: any) => item.task) || [];
      }
    } catch {
      // Fallback to simple extraction
    }
    return content.split('\n').filter(line => line.toLowerCase().includes('action') || line.toLowerCase().includes('todo'));
  }

  private extractTimelineSuggestions(content: string): string[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.recommendations || [];
      }
    } catch {
      // Fallback to simple extraction
    }
    return content.split('\n').filter(line => line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest'));
  }

  private extractCodeSuggestions(content: string): string[] {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.improvements || [];
      }
    } catch {
      // Fallback to simple extraction
    }
    return content.split('\n').filter(line => line.toLowerCase().includes('improve') || line.toLowerCase().includes('suggest'));
  }

  async getCachedResponse(cacheKey: string): Promise<AIResponse | null> {
    try {
      const cached = await redis.getCache(cacheKey);
      return cached;
    } catch {
      return null;
    }
  }

  async cacheResponse(cacheKey: string, response: AIResponse, ttl = 3600): Promise<void> {
    try {
      await redis.setCache(cacheKey, response, ttl);
    } catch (error) {
      logger.error('Failed to cache AI response:', error);
    }
  }
}

const aiService = new AIService();
export default aiService; 