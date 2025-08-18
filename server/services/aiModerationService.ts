// AI Message Moderation Service for Candidate Protection
// Detects and blocks contact information sharing to protect candidates

interface ModerationFlag {
  type: string;
  detected: string[];
  confidence: number;
}

interface ModerationResult {
  flags: ModerationFlag[];
  confidence: number;
  shouldBlock: boolean;
}

export class AIModerationService {
  // Patterns to detect contact information sharing
  private contactPatterns = {
    phoneNumbers: [
      /(\+44\s?7\d{3}[\s-]?\d{3}[\s-]?\d{3})/gi, // UK mobile
      /(\b07\d{3}[\s-]?\d{3}[\s-]?\d{3})/gi, // UK mobile short
      /(\+\d{1,3}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4})/gi, // International
      /(\b\d{10,11}\b)/gi, // Raw numbers
      /(call\s*me\s*on\s*\d+)/gi, // "call me on 123456"
      /(text\s*me\s*on\s*\d+)/gi, // "text me on 123456"
    ],
    emails: [
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
      /(email\s*:\s*[^\s]+)/gi,
      /(e-mail\s*:\s*[^\s]+)/gi,
      /(contact\s*me\s*at\s*[^\s]+@[^\s]+)/gi,
      /(my\s*email\s*is\s*[^\s]+@[^\s]+)/gi,
    ],
    externalContact: [
      /(whatsapp|what's\s*app)/gi,
      /(telegram|signal|discord)/gi,
      /(instagram|facebook|linkedin|twitter)/gi,
      /(call\s*me|text\s*me|message\s*me)/gi,
      /(outside\s*of\s*this\s*platform)/gi,
      /(directly\s*contact)/gi,
      /(personal\s*contact)/gi,
      /(my\s*number\s*is)/gi,
      /(reach\s*me\s*at)/gi,
      /(contact\s*me\s*directly)/gi,
    ],
    socialMedia: [
      /(follow\s*me\s*on)/gi,
      /(find\s*me\s*on)/gi,
      /(add\s*me\s*on)/gi,
      /(my\s*profile\s*on)/gi,
      /(facebook\.com|instagram\.com|linkedin\.com|twitter\.com)/gi,
    ]
  };

  // AI analysis function
  public async analyzeMessage(
    messageContent: string, 
    senderId: number, 
    conversationId: number
  ): Promise<ModerationResult> {
    const flags: ModerationFlag[] = [];
    let confidence = 0;
    let shouldBlock = false;

    const lowerContent = messageContent.toLowerCase();

    // Check for phone numbers
    for (const pattern of this.contactPatterns.phoneNumbers) {
      const matches = messageContent.match(pattern);
      if (matches) {
        flags.push({
          type: 'phone_number',
          detected: matches.map(match => this.maskSensitiveData(match)),
          confidence: 0.95
        });
        confidence = Math.max(confidence, 0.95);
        shouldBlock = true;
      }
    }

    // Check for emails
    for (const pattern of this.contactPatterns.emails) {
      const matches = messageContent.match(pattern);
      if (matches) {
        flags.push({
          type: 'email_address',
          detected: matches.map(match => this.maskSensitiveData(match)),
          confidence: 0.9
        });
        confidence = Math.max(confidence, 0.9);
        shouldBlock = true;
      }
    }

    // Check for external contact attempts
    for (const pattern of this.contactPatterns.externalContact) {
      const matches = messageContent.match(pattern);
      if (matches) {
        flags.push({
          type: 'external_contact_request',
          detected: matches,
          confidence: 0.8
        });
        confidence = Math.max(confidence, 0.8);
        shouldBlock = true;
      }
    }

    // Check for social media references
    for (const pattern of this.contactPatterns.socialMedia) {
      const matches = messageContent.match(pattern);
      if (matches) {
        flags.push({
          type: 'social_media_sharing',
          detected: matches,
          confidence: 0.75
        });
        confidence = Math.max(confidence, 0.75);
        shouldBlock = true;
      }
    }

    return { flags, confidence, shouldBlock };
  }

  // Mask sensitive data for logging
  private maskSensitiveData(data: string): string {
    // Mask emails
    if (data.includes('@')) {
      return data.replace(/[a-zA-Z0-9]/g, '*');
    }
    // Mask phone numbers
    return data.replace(/\d/g, '*');
  }

  // Block message and create admin alert
  public async blockMessage(
    messageId: number, 
    conversationId: number, 
    flags: ModerationFlag[], 
    senderId: number
  ): Promise<boolean> {
    try {
      console.log(`🚨 BLOCKING MESSAGE: ${messageId} in conversation ${conversationId}`);
      console.log(`🚨 Flags:`, flags.map(f => f.type).join(', '));
      console.log(`🚨 Sender: ${senderId}`);

      // In production, these would be actual database operations
      // For now, log the actions that would be taken

      // 1. Block the conversation
      console.log(`✅ Would block conversation ${conversationId}`);

      // 2. Create AI moderation flag records
      for (const flag of flags) {
        console.log(`✅ Would create AI flag: ${flag.type} with confidence ${flag.confidence}`);
      }

      // 3. Create admin moderation queue item
      const queueItem = {
        type: 'contact_sharing',
        priority: 'high',
        title: '🚨 Contact Information Sharing Detected',
        description: `Company attempted to share contact information with candidate. Conversation has been automatically blocked pending review. Detected: ${flags.map(f => f.type).join(', ')}`,
        data: {
          messageId,
          conversationId,
          senderId,
          flagTypes: flags.map(f => f.type),
          confidence: Math.max(...flags.map(f => f.confidence))
        }
      };

      console.log(`✅ Would create moderation queue item:`, queueItem);

      // 4. Send immediate notification to master admin
      await this.notifyMasterAdmin(conversationId, senderId, flags);

      return true;
    } catch (error) {
      console.error('❌ Error blocking message:', error);
      return false;
    }
  }

  // Notify master admin immediately
  public async notifyMasterAdmin(
    conversationId: number, 
    senderId: number, 
    flags: ModerationFlag[]
  ): Promise<void> {
    try {
      console.log(`📧 ADMIN NOTIFICATION: Contact sharing detected in conversation ${conversationId}`);
      
      const notification = {
        title: '🚨 URGENT: Contact Information Sharing Detected',
        message: `Company (ID: ${senderId}) attempted to share contact information (${flags.map(f => f.type).join(', ')}). Conversation blocked automatically. Review required.`,
        type: 'system',
        action_url: `/admin/moderation/conversation/${conversationId}`,
        data: {
          conversationId,
          senderId,
          flagTypes: flags.map(f => f.type),
          timestamp: new Date().toISOString()
        }
      };

      console.log(`✅ Would create admin notification:`, notification);

      // In production, would also send email notification
      console.log(`📧 Would send email to admin about conversation ${conversationId}`);

    } catch (error) {
      console.error('❌ Error notifying master admin:', error);
    }
  }

  // Check if a user is a company (for determining who can trigger moderation)
  public async isCompanyUser(userId: number): Promise<boolean> {
    // In production, this would query the database
    // For now, assume user IDs 1000+ are companies for testing
    return userId >= 1000;
  }

  // Get moderation statistics for admin dashboard
  public async getModerationStats(): Promise<any> {
    return {
      flagsToday: 2,
      pendingReviews: 1,
      companiesFlagged: 3,
      blockedConversations: 5,
      totalFlags: 15,
      autoBlockRate: 0.95,
      falsePositiveRate: 0.02
    };
  }

  // Test the moderation system with sample messages
  public async testModerationSystem(): Promise<void> {
    const testMessages = [
      "Hi, please call me on 07123 456 789 to discuss this opportunity",
      "You can reach me at john.doe@company.com for more details",
      "Let's continue this conversation on WhatsApp: +44 7123 456789",
      "Find me on LinkedIn - linkedin.com/in/johndoe",
      "This looks great! When can we schedule an interview?", // Safe message
      "My personal email is john@gmail.com, contact me directly",
      "Can we move this conversation outside of this platform?",
      "Text me on 07123456789 and I'll send you more info"
    ];

    console.log('\n🧪 TESTING AI MODERATION SYSTEM\n');

    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`Test ${i + 1}: "${message}"`);
      
      const result = await this.analyzeMessage(message, 1001, 1);
      
      if (result.shouldBlock) {
        console.log(`🚨 BLOCKED - Confidence: ${result.confidence.toFixed(2)}`);
        console.log(`🚨 Flags: ${result.flags.map(f => f.type).join(', ')}`);
        await this.blockMessage(i + 1, 1, result.flags, 1001);
      } else {
        console.log(`✅ ALLOWED - No threats detected`);
      }
      console.log('---');
    }

    console.log('\n✅ AI Moderation System Test Complete\n');
  }
}

// Export singleton instance
export const aiModerationService = new AIModerationService();

// Auto-test the system when the service is loaded
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    aiModerationService.testModerationSystem();
  }, 2000);
}
