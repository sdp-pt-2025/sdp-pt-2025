import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Bug, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  Eye, 
  MessageSquare,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface BugData {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'api' | 'performance' | 'security' | 'data' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'duplicate';
  priority: number;
  reporterId: string;
  reporterName: string;
  assignedTo: string | null;
  assignedToName: string | null;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  environment: {
    browser: string;
    os: string;
    device: string;
    version: string;
  };
  votes: number;
  watchers: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

interface BugTrackerProps {
  className?: string;
}

const BugTracker: React.FC<BugTrackerProps> = ({ className = '' }) => {
  const [bugs, setBugs] = useState<BugData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<BugData | null>(null);
  const [bugForm, setBugForm] = useState({
    title: '',
    description: '',
    severity: 'medium' as const,
    category: 'other' as const,
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    environment: {
      browser: '',
      os: '',
      device: '',
      version: ''
    }
  });
  const { user } = useAuth();

  const fetchBugs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/bugs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bugs');
      }

      const data = await response.json();
      setBugs(data.bugs || []);
    } catch (error) {
      toast.error('Failed to load bug reports');
      console.error('Error fetching bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBugs = async () => {
    if (!user || !searchQuery.trim()) {
      fetchBugs();
      return;
    }
    
    try {
      const token = await user.getIdToken();
      
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/bugs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search bugs');
      }

      const data = await response.json();
      setBugs(data.bugs || []);
    } catch (error) {
      toast.error('Failed to search bug reports');
      console.error('Error searching bugs:', error);
    }
  };

  const createBug = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bugForm)
      });

      if (!response.ok) {
        throw new Error('Failed to create bug report');
      }

      toast.success('Bug report created successfully');
      setCreateDialogOpen(false);
      setBugForm({
        title: '',
        description: '',
        severity: 'medium',
        category: 'other',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        environment: {
          browser: '',
          os: '',
          device: '',
          version: ''
        }
      });
      fetchBugs();
    } catch (error) {
      toast.error('Failed to create bug report');
      console.error('Error creating bug:', error);
    }
  };

  const voteBug = async (bugId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/bugs/${bugId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to vote on bug');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchBugs();
    } catch (error) {
      toast.error('Failed to vote on bug');
      console.error('Error voting on bug:', error);
    }
  };

  const watchBug = async (bugId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      
      const response = await fetch(`/api/bugs/${bugId}/watch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to watch bug');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchBugs();
    } catch (error) {
      toast.error('Failed to watch bug');
      console.error('Error watching bug:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'duplicate':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchBugs();
  }, [user, statusFilter, severityFilter, categoryFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchBugs();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredBugs = bugs.filter(bug => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bug.title.toLowerCase().includes(query) ||
      bug.description.toLowerCase().includes(query) ||
      bug.reporterName.toLowerCase().includes(query)
    );
  });

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Bug Tracker
            </CardTitle>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Report a Bug</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={bugForm.title}
                      onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                      placeholder="Brief description of the bug"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={bugForm.description}
                      onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                      placeholder="Detailed description of the bug"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="severity">Severity *</Label>
                      <Select
                        value={bugForm.severity}
                        onValueChange={(value: any) => setBugForm({ ...bugForm, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={bugForm.category}
                        onValueChange={(value: any) => setBugForm({ ...bugForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ui">UI</SelectItem>
                          <SelectItem value="api">API</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="data">Data</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
                    <Textarea
                      id="stepsToReproduce"
                      value={bugForm.stepsToReproduce}
                      onChange={(e) => setBugForm({ ...bugForm, stepsToReproduce: e.target.value })}
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                      <Textarea
                        id="expectedBehavior"
                        value={bugForm.expectedBehavior}
                        onChange={(e) => setBugForm({ ...bugForm, expectedBehavior: e.target.value })}
                        placeholder="What should happen?"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="actualBehavior">Actual Behavior</Label>
                      <Textarea
                        id="actualBehavior"
                        value={bugForm.actualBehavior}
                        onChange={(e) => setBugForm({ ...bugForm, actualBehavior: e.target.value })}
                        placeholder="What actually happens?"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="browser">Browser</Label>
                      <Input
                        id="browser"
                        value={bugForm.environment.browser}
                        onChange={(e) => setBugForm({ 
                          ...bugForm, 
                          environment: { ...bugForm.environment, browser: e.target.value }
                        })}
                        placeholder="e.g., Chrome 120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="os">Operating System</Label>
                      <Input
                        id="os"
                        value={bugForm.environment.os}
                        onChange={(e) => setBugForm({ 
                          ...bugForm, 
                          environment: { ...bugForm.environment, os: e.target.value }
                        })}
                        placeholder="e.g., Windows 11"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={createBug}
                      disabled={!bugForm.title || !bugForm.description}
                    >
                      Submit Bug Report
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bug reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ui">UI</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bugs List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : filteredBugs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bug reports found</p>
              <p className="text-sm">Be the first to report a bug</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBugs.map((bug) => (
                <div key={bug.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{bug.title}</h3>
                        <Badge variant="outline" className={getSeverityColor(bug.severity)}>
                          {bug.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(bug.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(bug.status)}
                            {bug.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {bug.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {bug.reporterName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(bug.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {bug.votes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {bug.watchers.length} watchers
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => voteBug(bug.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => watchBug(bug.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BugTracker;
