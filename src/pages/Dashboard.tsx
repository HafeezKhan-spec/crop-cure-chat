import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Camera, 
  Mic, 
  Send, 
  Paperclip, 
  Trash2, 
  Leaf, 
  Bot,
  User,
  FileText,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: string; url: string }[];
}

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: Date;
}

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AgriClip AI assistant. I can help you identify crop diseases, provide treatment recommendations, and answer agricultural questions. Upload an image or ask me anything!',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    // Simulate file processing
    setTimeout(() => {
      const fileUrl = URL.createObjectURL(file);
      const newFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        timestamp: new Date(),
      };

      setUploadedFiles(prev => [newFile, ...prev]);
      setUploadProgress(100);
      
      // Add message with uploaded image
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'I\'ve uploaded an image for analysis',
        timestamp: new Date(),
        attachments: [{ name: file.name, type: file.type, url: fileUrl }],
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'I\'ve analyzed your crop image. Based on the visual indicators, I can see signs of potential leaf spot disease. Here are my recommendations:\n\n🔍 **Diagnosis**: Likely bacterial leaf spot\n🎯 **Confidence**: 85%\n💊 **Treatment**: Apply copper-based fungicide\n📅 **Follow-up**: Check in 7-10 days\n\n*Note: This is an AI analysis. Please consult with an agricultural expert for confirmation.*',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        scrollToBottom();
      }, 2000);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

      toast({
        title: "Image uploaded successfully",
        description: "AI analysis in progress...",
      });
      
      scrollToBottom();
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great question about crop management! Based on current agricultural best practices, I recommend...",
        "For optimal plant health, consider these factors: soil pH, moisture levels, and nutrient balance. Would you like me to elaborate on any of these?",
        "Disease prevention is crucial in agriculture. Regular monitoring and early intervention can save entire crops. What specific concerns do you have?",
        "Weather conditions play a vital role in crop health. Have you noticed any recent changes in your local climate patterns?",
      ];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      scrollToBottom();
    }, 1500);

    scrollToBottom();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: 'Chat cleared! How can I help you today?',
        timestamp: new Date(),
      }
    ]);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6 text-center animate-fade-in">
        <h1 className="text-3xl font-bold gradient-text mb-2">AgriClip Dashboard</h1>
        <p className="text-muted-foreground">
          AI-powered crop disease detection and agricultural assistance
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Image Upload */}
        <div className="space-y-4 animate-slide-up">
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Crop Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div
                className="upload-area cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="space-y-4">
                  <div className="mx-auto h-12 w-12 text-muted-foreground">
                    <ImageIcon className="h-full w-full" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Drop your crop image here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, WebP (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading and analyzing...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  Browse Files
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-sm">Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                {uploadedFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No uploads yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded border">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {file.timestamp.toLocaleTimeString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="flex flex-col animate-slide-up">
          <Card className="floating-card flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <Separator />
            
            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`chat-bubble ${
                          message.type === 'user' 
                            ? 'chat-bubble-user' 
                            : 'chat-bubble-ai'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0">
                            {message.type === 'user' ? (
                              <User className="h-4 w-4 mt-1" />
                            ) : (
                              <Leaf className="h-4 w-4 mt-1 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {message.attachments && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="border rounded p-2">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="max-w-full h-32 object-cover rounded"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {attachment.name}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="chat-bubble chat-bubble-ai">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            AI is typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about crop diseases, farming techniques, or upload an image..."
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;