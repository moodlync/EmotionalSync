import React, { useState, useEffect } from 'react';
import { AlertCircle, Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { seoConfig } from '@/components/seo/seo-config';
import SEOHead from '@/components/seo/seo-head';
import { useMutation, useQuery } from '@tanstack/react-query';

// Type for SEO page configuration
type SeoPageConfig = {
  title: string;
  description: string;
  keywords: string[];
  noindex?: boolean;
};

// Schema for SEO form validation
const seoPageSchema = z.object({
  pageKey: z.string().min(1, "Page key is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(70, "Title should be no more than 70 characters"),
  description: z.string().min(50, "Description must be at least 50 characters").max(160, "Description should be no more than 160 characters"),
  keywords: z.string().transform(val => val.split(',').map(k => k.trim()).filter(k => k.length > 0)),
  noindex: z.boolean().default(false),
});

// Keyword item component
const KeywordItem = ({ keyword, onDelete }: { keyword: string; onDelete: () => void }) => (
  <Badge variant="secondary" className="mr-1 mb-1 px-2 py-1 text-xs">
    {keyword}
    <button onClick={onDelete} className="ml-1 text-muted-foreground hover:text-destructive">
      <Trash2 size={12} />
    </button>
  </Badge>
);

// Mock API function for SEO updates (for prototyping)
// In production, this would be replaced with actual API calls
const updateSeoConfig = async (key: string, config: SeoPageConfig) => {
  // Simulated API call
  console.log(`Updating SEO config for ${key}:`, config);
  return { success: true, data: config };
};

// SEO Insights component that gives suggestions based on current settings
const SeoInsights = ({ pageKey, title, description, keywords }: { 
  pageKey: string; 
  title: string; 
  description: string;
  keywords: string[];
}) => {
  const titleLength = title.length;
  const descriptionLength = description.length;
  const keywordsCount = keywords.length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">SEO Insights</CardTitle>
        <CardDescription>Analysis and suggestions for your SEO settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">Title ({titleLength}/70)</h4>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${titleLength < 30 ? 'bg-yellow-500' : titleLength > 60 ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min((titleLength / 70) * 100, 100)}%` }}
            />
          </div>
          {titleLength < 30 && (
            <p className="text-xs text-muted-foreground mt-1">Title is too short. Aim for 50-60 characters for optimal visibility.</p>
          )}
          {titleLength > 60 && (
            <p className="text-xs text-muted-foreground mt-1">Title is approaching the display limit. It may get truncated in search results.</p>
          )}
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Description ({descriptionLength}/160)</h4>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${descriptionLength < 80 ? 'bg-yellow-500' : descriptionLength > 150 ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min((descriptionLength / 160) * 100, 100)}%` }}
            />
          </div>
          {descriptionLength < 80 && (
            <p className="text-xs text-muted-foreground mt-1">Description is too short. Aim for 120-155 characters for best results.</p>
          )}
          {descriptionLength > 150 && (
            <p className="text-xs text-muted-foreground mt-1">Description is approaching the display limit. It may get truncated in search results.</p>
          )}
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Keywords ({keywordsCount})</h4>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${keywordsCount < 5 ? 'bg-yellow-500' : keywordsCount > 15 ? 'bg-yellow-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min((keywordsCount / 20) * 100, 100)}%` }}
            />
          </div>
          {keywordsCount < 5 && (
            <p className="text-xs text-muted-foreground mt-1">Consider adding more keywords to improve discoverability.</p>
          )}
          {keywordsCount > 15 && (
            <p className="text-xs text-muted-foreground mt-1">Too many keywords may dilute your SEO focus. Consider narrowing down.</p>
          )}
        </div>
        
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>SEO Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 text-xs space-y-1 mt-2">
              <li>Include primary keyword near the beginning of the title</li>
              <li>Ensure description contains 2-3 important keywords</li>
              <li>Make sure description accurately summarizes the page content</li>
              <li>Use specific, targeted keywords rather than generic terms</li>
              <li>Consider adding structured data for enhanced search results</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

// SEO Preview component showing how page might appear in search results
const SeoPreview = ({ title, description }: { title: string; description: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Search Result Preview</CardTitle>
      <CardDescription>How your page might appear in search results</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="border rounded-md p-4 max-w-2xl">
        <div className="text-blue-600 text-xl font-medium truncate">{title || "Page Title"}</div>
        <div className="text-green-700 text-sm">{window.location.origin}/...</div>
        <div className="text-gray-800 text-sm mt-1 line-clamp-2">{description || "Page description will appear here. Make sure it's compelling and contains relevant keywords."}</div>
      </div>
    </CardContent>
  </Card>
);

// Main SEO Management Page Component
const AdminSeoPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [keywordInput, setKeywordInput] = useState("");
  const [currentConfig, setCurrentConfig] = useState<Record<string, SeoPageConfig>>(
    Object.entries(seoConfig).reduce((acc, [key, config]) => {
      return {
        ...acc,
        [key]: {
          title: config.title,
          description: config.description,
          keywords: config.keywords,
          noindex: config.noindex || false,
        }
      };
    }, {})
  );

  // Set up form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof seoPageSchema>>({
    resolver: zodResolver(seoPageSchema),
    defaultValues: {
      pageKey: activeTab,
      title: currentConfig[activeTab]?.title || "",
      description: currentConfig[activeTab]?.description || "",
      keywords: currentConfig[activeTab]?.keywords.join(", ") || "",
      noindex: currentConfig[activeTab]?.noindex || false,
    },
  });

  // Update form values when active tab changes
  useEffect(() => {
    form.reset({
      pageKey: activeTab,
      title: currentConfig[activeTab]?.title || "",
      description: currentConfig[activeTab]?.description || "",
      keywords: currentConfig[activeTab]?.keywords.join(", ") || "",
      noindex: currentConfig[activeTab]?.noindex || false,
    });
  }, [activeTab, currentConfig, form]);

  // Save SEO settings mutation
  const saveMutation = useMutation({
    mutationFn: async (values: z.infer<typeof seoPageSchema>) => {
      const { pageKey, ...seoData } = values;
      return updateSeoConfig(pageKey, {
        ...seoData,
        keywords: typeof seoData.keywords === 'string' 
          ? seoData.keywords.split(',').map(k => k.trim()).filter(Boolean) 
          : seoData.keywords
      });
    },
    onSuccess: (_, variables) => {
      const { pageKey, ...seoData } = variables;
      
      // Update local state with the new config
      setCurrentConfig(prev => ({
        ...prev,
        [pageKey]: {
          ...seoData,
          keywords: typeof seoData.keywords === 'string' 
            ? seoData.keywords.split(',').map(k => k.trim()).filter(Boolean) 
            : seoData.keywords
        }
      }));
      
      toast({
        title: "SEO settings saved",
        description: `SEO configuration for ${pageKey} has been updated.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save SEO settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof seoPageSchema>) => {
    saveMutation.mutate(values);
  };

  // Handle keyword addition
  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    
    const currentKeywords = form.getValues("keywords");
    const keywordsArray = typeof currentKeywords === 'string' 
      ? currentKeywords.split(',').map(k => k.trim()).filter(Boolean) 
      : currentKeywords;
      
    if (!keywordsArray.includes(keywordInput.trim())) {
      const newKeywords = [...keywordsArray, keywordInput.trim()];
      form.setValue("keywords", newKeywords.join(", "));
    }
    
    setKeywordInput("");
  };

  // Handle keyword deletion
  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues("keywords");
    const keywordsArray = typeof currentKeywords === 'string' 
      ? currentKeywords.split(',').map(k => k.trim()).filter(Boolean) 
      : currentKeywords;
      
    const newKeywords = keywordsArray.filter(k => k !== keyword);
    form.setValue("keywords", newKeywords.join(", "));
  };

  // Get current keywords as array
  const getCurrentKeywords = (): string[] => {
    const keywords = form.getValues("keywords");
    return typeof keywords === 'string' 
      ? keywords.split(',').map(k => k.trim()).filter(Boolean)
      : keywords;
  };

  return (
    <AdminLayout>
      <SEOHead 
        title={seoConfig.admin?.title || "SEO Management | MoodSync Admin"}
        description={seoConfig.admin?.description || "Manage SEO settings for MoodSync platform."}
        keywords={seoConfig.admin?.keywords}
        noindex={true}
      />
      
      <div className="container p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">SEO Management</h1>
          <p className="text-muted-foreground mt-2">
            Optimize search engine visibility by configuring page titles, descriptions, and keywords
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-4">
              {Object.keys(seoConfig).map(key => (
                <TabsTrigger key={key} value={key} className="capitalize">
                  {key}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {Object.keys(seoConfig).map(key => (
            <TabsContent key={key} value={key} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{key.charAt(0).toUpperCase() + key.slice(1)} Page SEO Settings</CardTitle>
                      <CardDescription>Configure search engine optimization settings for the {key} page</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <input type="hidden" {...form.register("pageKey")} value={activeTab} />
                          
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Page Title <span className="text-xs text-muted-foreground ml-1">({field.value.length}/70)</span></FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter page title" />
                                </FormControl>
                                <FormDescription>
                                  Optimal length is 50-60 characters. Include important keywords near the start.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meta Description <span className="text-xs text-muted-foreground ml-1">({field.value.length}/160)</span></FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Enter meta description" 
                                    className="resize-none h-24"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Optimal length is 120-155 characters. Include 2-3 important keywords.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div>
                            <FormLabel>Keywords</FormLabel>
                            <div className="flex mt-1.5 mb-3">
                              <Input 
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                placeholder="Add keyword"
                                className="mr-2"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addKeyword();
                                  }
                                }}
                              />
                              <Button 
                                type="button" 
                                onClick={addKeyword}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap mb-2 min-h-10">
                              {getCurrentKeywords().map((keyword, index) => (
                                <KeywordItem 
                                  key={index} 
                                  keyword={keyword} 
                                  onDelete={() => removeKeyword(keyword)} 
                                />
                              ))}
                            </div>
                            <FormDescription>
                              Add 8-12 relevant keywords that accurately describe the page content.
                            </FormDescription>
                            <FormField
                              control={form.control}
                              name="keywords"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="hidden" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="noindex"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-2">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                </FormControl>
                                <div>
                                  <FormLabel>Exclude from search engines</FormLabel>
                                  <FormDescription>
                                    If checked, search engines will not index this page.
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                form.reset({
                                  pageKey: activeTab,
                                  title: seoConfig[activeTab]?.title || "",
                                  description: seoConfig[activeTab]?.description || "",
                                  keywords: seoConfig[activeTab]?.keywords.join(", ") || "",
                                  noindex: seoConfig[activeTab]?.noindex || false,
                                });
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" /> Reset
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={saveMutation.isPending}
                            >
                              {saveMutation.isPending && (
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              )}
                              {!saveMutation.isPending && (
                                <Save className="h-4 w-4 mr-1" />
                              )}
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <SeoPreview 
                    title={form.watch("title")} 
                    description={form.watch("description")} 
                  />
                  
                  <SeoInsights 
                    pageKey={activeTab}
                    title={form.watch("title")}
                    description={form.watch("description")}
                    keywords={getCurrentKeywords()}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSeoPage;