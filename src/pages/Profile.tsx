import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Edit3, 
  Camera, 
  Save, 
  X, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Leaf,
  MessageCircle,
  Upload,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HistoryItem {
  id: string;
  type: 'upload' | 'chat';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'healthy' | 'disease' | 'warning';
  confidence?: number;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("userName") || "John Farmer",
    email: "john.farmer@example.com",
    phone: "+1 (555) 123-4567",
    location: "Iowa, United States",
    bio: "Organic farmer with 15+ years of experience. Passionate about sustainable agriculture and crop health management.",
    farmSize: "250 acres",
    primaryCrops: "Corn, Soybeans, Wheat",
  });

  const [history] = useState<HistoryItem[]>([
    {
      id: '1',
      type: 'upload',
      title: 'Corn Leaf Analysis',
      description: 'Detected: Northern Corn Leaf Blight',
      timestamp: new Date('2024-01-15T10:30:00'),
      status: 'disease',
      confidence: 87,
    },
    {
      id: '2',
      type: 'chat',
      title: 'Soil pH Management',
      description: 'Asked about optimal soil pH levels for soybeans',
      timestamp: new Date('2024-01-14T15:45:00'),
    },
    {
      id: '3',
      type: 'upload',
      title: 'Wheat Field Survey',
      description: 'All crops appear healthy',
      timestamp: new Date('2024-01-13T09:15:00'),
      status: 'healthy',
      confidence: 94,
    },
    {
      id: '4',
      type: 'chat',
      title: 'Pest Control Query',
      description: 'Discussed integrated pest management strategies',
      timestamp: new Date('2024-01-12T14:20:00'),
    },
    {
      id: '5',
      type: 'upload',
      title: 'Soybean Inspection',
      description: 'Early signs of nutrient deficiency detected',
      timestamp: new Date('2024-01-11T11:10:00'),
      status: 'warning',
      confidence: 76,
    },
  ]);

  const stats = {
    totalAnalyses: 47,
    healthyDetections: 32,
    diseaseDetections: 12,
    chatSessions: 23,
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    // Mock save - replace with actual API call
    localStorage.setItem("userName", profileData.name);
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'bg-success text-success-foreground';
      case 'disease': return 'bg-destructive text-destructive-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (type: string) => {
    return type === 'upload' ? <Upload className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and view your AgriClip activity
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="floating-card">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <CardTitle className="text-xl">{profileData.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 justify-center">
                  <MapPin className="h-3 w-3" />
                  {profileData.location}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {profileData.bio}
                </p>
                <Badge variant="outline" className="bg-primary/10">
                  <Leaf className="h-3 w-3 mr-1" />
                  Verified Farmer
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Farm Size:</span>
                  <span className="text-muted-foreground">{profileData.farmSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Primary Crops:</span>
                </div>
                <p className="text-muted-foreground text-xs ml-6">
                  {profileData.primaryCrops}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="floating-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Analyses</span>
                <Badge variant="secondary">{stats.totalAnalyses}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Healthy Crops</span>
                <Badge className="bg-success text-success-foreground">{stats.healthyDetections}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Issues Found</span>
                <Badge className="bg-warning text-warning-foreground">{stats.diseaseDetections}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Chat Sessions</span>
                <Badge variant="outline">{stats.chatSessions}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="history">Activity History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card className="floating-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your profile details and preferences
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "ghost" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                      } else {
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size</Label>
                      <Input
                        id="farmSize"
                        value={profileData.farmSize}
                        onChange={(e) => handleInputChange('farmSize', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryCrops">Primary Crops</Label>
                      <Input
                        id="primaryCrops"
                        value={profileData.primaryCrops}
                        onChange={(e) => handleInputChange('primaryCrops', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveProfile} className="bg-gradient-primary hover:opacity-90">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="floating-card">
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                  <CardDescription>
                    Your recent AgriClip analyses and conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 animate-scale-in">
                          <div className={`p-2 rounded-full ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{item.title}</h4>
                              {item.confidence && (
                                <Badge variant="outline" className="text-xs">
                                  {item.confidence}% confidence
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;