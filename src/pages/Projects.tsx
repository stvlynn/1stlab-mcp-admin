import React, { useState, useEffect } from 'react';
import { Edit, Trash2, CheckCircle, XCircle, Plus, Loader2, Download, RefreshCw } from 'lucide-react';
import type { Project } from '../types/project';
import { supabase } from '../services/supabase';
import { useCrawler } from '../contexts/CrawlerContext';
import { baiduCrawler } from '../services/baiduCrawler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: '',
    github_url: '',
    demo_url: ''
  });
  const { progress, startCrawl, updateProgress } = useCrawler();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (id: number, is_approved: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_approved })
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => 
        prev.map(p => p.id === id ? { ...p, is_approved } : p)
      );
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const toggleFeatured = async (id: number, is_featured: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_featured })
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => 
        prev.map(p => p.id === id ? { ...p, is_featured } : p)
      );
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...formData,
          is_approved: null,
          is_featured: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      setShowAddModal(false);
      setFormData({
        name: '',
        url: '',
        description: '',
        category: '',
        github_url: '',
        demo_url: ''
      });
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleBaiduCrawl = async () => {
    startCrawl();
    
    try {
      await baiduCrawler.crawlBaiduProjects((progressData) => {
        updateProgress(progressData);
      });
      await fetchProjects(); // Refresh the list after crawling
    } catch (error) {
      console.error('Error during Baidu crawl:', error);
      updateProgress({
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false,
      });
    }
  };

  const handleCrawlTest = async () => {
    try {
      await baiduCrawler.testCrawl();
    } catch (error) {
      console.error('Error during test crawl:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getStatusBadgeVariant = (is_approved: boolean | null) => {
    if (is_approved === true) return 'default';
    if (is_approved === false) return 'destructive';
    return 'secondary';
  };

  const getStatusText = (is_approved: boolean | null) => {
    if (is_approved === true) return 'Approved';
    if (is_approved === false) return 'Rejected';
    return 'Pending';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and review submitted projects</p>
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={progress.isRunning}>
                {progress.isRunning ? 'Crawling...' : 'Crawl from Source'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleBaiduCrawl} disabled={progress.isRunning}>
                <Download className="mr-2 h-4 w-4" />
                Baidu Source
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCrawlTest} disabled={progress.isRunning}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Test Baidu Crawl
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowAddModal(true)} disabled={progress.isRunning}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      {progress.isRunning && (
        <Alert>
          <AlertTitle>Crawler Progress</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{progress.message}</span>
                <span>Page {progress.currentPage} of {progress.totalPages}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((progress.currentPage / progress.totalPages) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="text-sm text-gray-600">
                Imported: {progress.totalImported} projects
                {progress.currentPageProjects > 0 && (
                  <span className="ml-2">(Current page: {progress.currentPageProjects} projects)</span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {progress.error && (
        <Alert variant="destructive">
          <AlertTitle>Crawler Error</AlertTitle>
          <AlertDescription>{progress.error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            A list of all submitted projects including their status and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <Alert>
              <AlertTitle>No projects found</AlertTitle>
              <AlertDescription>
                There are no projects to display. Projects will appear here once submitted.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">{project.url}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.is_approved)}>
                        {getStatusText(project.is_approved)}
                      </Badge>
                      {project.is_featured && (
                        <Badge variant="default" className="ml-2 bg-purple-600">
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={project.is_featured}
                        onCheckedChange={(checked) => toggleFeatured(project.id, checked)}
                        aria-label="Toggle featured"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateProjectStatus(project.id, true)}
                          className="text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateProjectStatus(project.id, false)}
                          className="text-red-600 hover:text-red-700"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProject(project.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Add a new project to the directory for review.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProject}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="demo_url">Demo URL</Label>
                <Input
                  id="demo_url"
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    name: '',
                    url: '',
                    description: '',
                    category: '',
                    github_url: '',
                    demo_url: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;