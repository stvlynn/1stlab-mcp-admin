import { supabase } from './supabase';

interface BaiduMCPItem {
  id: string;
  serverName: string;
  description: string;
  serverUrl: string;
  labels: string[];
  mcpSource: string;
  creatTime: string;
  updateTime: string;
  star: number;
  creator: string;
}

interface BaiduResponse {
  code: number;
  data: {
    category: any[];
    count: number;
    mcpList: {
      query: string;
      total: number;
      servers: BaiduMCPItem[];
    }[];
    type: string;
  };
  msg: string;
  qid: string;
}

export class BaiduCrawlerService {
  private baseURL = '/api/baidu/servers';

  async crawlBaiduProjects(onProgress?: (progress: any) => void): Promise<void> {
    let page = 0;
    let hasMore = true;
    let totalImported = 0;
    const estimatedTotalProjects = 1000; // Rough estimate for progress calculation

    if (onProgress) {
      onProgress({
        isRunning: true,
        message: 'Starting Baidu crawler...',
        currentPage: 0,
        totalPages: Math.ceil(estimatedTotalProjects / 20),
        currentPageProjects: 0,
        totalImported: 0,
        error: null,
      });
    }

    try {
      // Get total count first
      const countResponse = await fetch(`${this.baseURL}?wd=star&type=tag&pn=0&lg=en`);
      const countData: BaiduResponse = await countResponse.json();
      const totalCount = countData.data.count;
      const totalPages = Math.ceil(totalCount / 20);

      if (onProgress) {
        onProgress({
          totalPages,
          message: `Found ${totalCount} total projects, starting crawl...`,
        });
      }

      console.log(`Starting Baidu crawler with ${totalCount} total projects...`);

      while (hasMore) {
        try {
          if (onProgress) {
            onProgress({
              currentPage: page + 1,
              message: `Processing page ${page + 1} of ${totalPages}...`,
            });
          }

          const response = await fetch(`${this.baseURL}?wd=star&type=tag&pn=${page}&lg=en`);
          
          if (!response.ok) {
            const error = `HTTP error! status: ${response.status}`;
            if (onProgress) {
              onProgress({ error, isRunning: false });
            }
            console.error(error);
            break;
          }
          
          const data: BaiduResponse = await response.json();

          // Check if we've reached the end
          if (!data.data.mcpList || data.data.mcpList.length === 0 || !data.data.mcpList[0]?.servers) {
            if (onProgress) {
              onProgress({
                message: 'No more projects found, crawl completed',
                isRunning: false,
              });
            }
            console.log('No more projects found, stopping crawl');
            hasMore = false;
            break;
          }

          const servers = data.data.mcpList[0].servers;
          const currentProjects = servers.length;
          if (onProgress) {
            onProgress({
              currentPageProjects: currentProjects,
              message: `Found ${currentProjects} projects on page ${page + 1}`,
            });
          }

          // Filter and process projects with mcpSource "spider==github.com"
          const githubProjects = servers.filter(item => 
            item.mcpSource === 'spider==github.com'
          );

          if (githubProjects.length > 0) {
            // Create minimal insert object with only required fields
            const projectsToImport = githubProjects.map(item => {
              const uuid = this.generateUUID();
              const minimalProject: any = {
                uuid: uuid,
                name: item.serverName,
                title: item.serverName,
                description: item.description,
                url: item.serverUrl,
                category: this.inferCategoryFromLabels(item.labels),
                tags: item.labels ? item.labels.join(',') : '',
                status: 'published',
                is_featured: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                author_name: item.creator || 'Unknown',
                target: '_blank'
              };
              
              // Add optional fields only if they exist in schema
              if (item.star) {
                minimalProject.sort = item.star; // Use stars for sorting
              }
              
              return minimalProject;
            });

            // Batch insert into Supabase
            let importedCount = 0;
            for (const project of projectsToImport) {
              try {
                await safeInsertProject(project);
                importedCount++;
              } catch (error) {
                console.error('Failed to insert project:', project.name, error);
              }
            }

            // Continue even if some inserts fail

            if (importedCount > 0) {
              totalImported += importedCount;
              if (onProgress) {
                onProgress({
                  totalImported,
                  message: `✅ Imported ${totalImported} projects so far...`,
                });
              }
              console.log(`✅ Imported ${importedCount} projects from page ${page}`);
            } else {
              if (onProgress) {
                onProgress({
                  message: `No projects imported from page ${page + 1}, continuing...`,
                });
              }
            }
          } else {
            if (onProgress) {
              onProgress({
                message: `No GitHub projects found on page ${page + 1}, continuing...`,
              });
            }
          }

          page++;

          // Add delay to be respectful to the API
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (onProgress) {
            onProgress({ error: errorMessage, isRunning: false });
          }
          console.error('❌ Error crawling Baidu projects:', error);
          break;
        }
      }

      if (onProgress) {
        onProgress({
          isRunning: false,
          message: `🎉 Crawl completed! Imported ${totalImported} projects`,
        });
      }
      console.log(`🎉 Total projects imported from Baidu: ${totalImported}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start crawler';
      if (onProgress) {
        onProgress({ error: errorMessage, isRunning: false });
      }
      console.error('❌ Error starting crawler:', error);
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private inferCategoryFromLabels(labels: string[]): string {
    if (!labels || labels.length === 0) {
      return 'Other';
    }

    const labelMapping: Record<string, string> = {
      'Code Editor': 'Development Tools',
      'GitHub API': 'Development Tools',
      'Database': 'Database',
      'Search Tool': 'Search Tools',
      'Map Service': 'Location Services',
      'Browser Automation': 'Browser Automation',
      'File Management': 'File Management',
      'Design Tool': 'Design Tools',
      'Image Generation': 'Content Generation',
      'Text-to-Speech': 'Content Generation',
      'Real-time Search': 'Search Tools',
      'Note Management': 'Productivity',
      'Weather Query': 'Utilities',
      'Git Automation': 'Development Tools',
      'Document Conversion': 'Content Generation',
      'Transaction Closed Loop': 'Financial Services',
      'Natural Language Processing': 'AI',
      'Edge Computing': 'Cloud Services',
      'Redis Service': 'Database',
      'Transcript Extraction': 'Content Generation',
      'Thinking Tool': 'AI',
      'AWS Knowledge Base Retrieval': 'Cloud Services',
      'Chart Generation': 'Data Visualization'
    };

    // Try to find a matching category based on labels
    for (const label of labels) {
      const normalizedLabel = label.trim();
      if (labelMapping[normalizedLabel]) {
        return labelMapping[normalizedLabel];
      }
    }

    // Default to Other if no match found
    return 'Other';
  }

  async testCrawl(): Promise<void> {
    // Test with first page
    const response = await fetch(`${this.baseURL}?wd=star&type=tag&pn=0&lg=en`);
    const data: BaiduResponse = await response.json();
    
    const servers = data.data.mcpList?.[0]?.servers || [];
    
    console.log('Test crawl results:', {
      totalCount: data.data.count,
      firstPageCount: servers.length,
      githubProjects: servers.filter(item => 
        item.mcpSource === 'spider==github.com'
      ).length
    });

    if (servers.length > 0) {
      const githubProjects = servers.filter(item => 
        item.mcpSource === 'spider==github.com'
      );
      
      // Test actual schema by trying to insert a single record
      console.log('Testing schema with first project...');
      const testProject = githubProjects[0];
      if (testProject) {
        try {
          const uuid = this.generateUUID();
          const { data: testInsert, error } = await supabase
            .from('projects')
            .insert([{
              uuid: uuid,
              name: testProject.serverName,
              title: testProject.serverName,
              description: testProject.description,
              url: testProject.serverUrl,
              category: this.inferCategoryFromLabels(testProject.labels),
              tags: testProject.labels ? testProject.labels.join(',') : '',
              status: 'published',
              is_featured: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              author_name: testProject.creator || 'Unknown',
              target: '_blank',
              sort: testProject.star || 0
            }])
            .select()
            .single();

          if (error) {
            console.error('Schema test failed:', error);
            console.error('Error details:', error.message);
            
            // Try progressively simpler schemas
            const uuid = this.generateUUID();
            const simpleTest = {
              uuid: uuid,
              name: testProject.serverName,
              title: testProject.serverName,
              url: testProject.serverUrl,
              description: testProject.description,
              category: this.inferCategoryFromLabels(testProject.labels),
              tags: testProject.labels ? testProject.labels.join(',') : ''
            };
            
            try {
              const { data: simpleInsert, error: simpleError } = await supabase
                .from('projects')
                .insert([simpleTest])
                .select()
                .single();

              if (simpleError) {
                console.error('Simple schema also failed:', simpleError.message);
                console.error('Try checking your Supabase table structure');
              } else {
                console.log('Simple schema worked:', simpleInsert);
                await supabase.from('projects').delete().eq('id', simpleInsert.id);
              }
            } catch (simpleError) {
              console.error('Simple schema test error:', simpleError);
            }
          } else {
            console.log('Schema test successful:', testInsert);
            // Clean up test record
            await supabase.from('projects').delete().eq('id', testInsert.id);
          }
        } catch (testError) {
          console.error('Schema testing error:', testError);
        }
      }

      console.log('Sample GitHub project:', testProject);
    }
  }
}

export const baiduCrawler = new BaiduCrawlerService();

// Safe insert function to handle schema issues
async function safeInsertProject(project: any) {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  // Build payload based on actual schema from install.sql
  const baseProject = {
    uuid: uuid,
    name: project.name || project.serverName,
    title: project.title || project.name || project.serverName,
    description: project.description,
    url: project.url || project.serverUrl,
    category: project.category || 'Other',
    tags: Array.isArray(project.tags) ? project.tags.join(',') : (project.tags || ''),
    status: 'published',
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_name: project.author_name || project.creator || 'Unknown',
    target: '_blank'
  };

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([baseProject])
      .select()
      .single();

    if (error) {
      console.error('Insert failed:', error.message);
      throw error;
    }
    
    return data;
  } catch (e) {
    console.error('Safe insert error:', e);
    throw e;
  }
}