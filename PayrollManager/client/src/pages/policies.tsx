import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Search, BookOpen, FileText } from 'lucide-react';
import type { Policy } from '@shared/schema';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function PoliciesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: policies, isLoading } = useQuery<Policy[]>({
    queryKey: ['/api/policies'],
  });

  const filteredPolicies = policies?.filter((policy) =>
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPolicies = filteredPolicies?.reduce((acc, policy) => {
    if (!acc[policy.category]) {
      acc[policy.category] = [];
    }
    acc[policy.category].push(policy);
    return acc;
  }, {} as Record<string, Policy[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Policy Hub</h1>
        <p className="text-muted-foreground mt-1">Company policies and procedures</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-policies"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Loading policies...</p>
          </CardContent>
        </Card>
      ) : groupedPolicies && Object.keys(groupedPolicies).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedPolicies).map(([category, categoryPolicies]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl capitalize">{category}</CardTitle>
                  <Badge variant="secondary">{categoryPolicies.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {categoryPolicies.map((policy) => (
                    <AccordionItem key={policy.id} value={policy.id} data-testid={`policy-${policy.id}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{policy.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 space-y-3">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{policy.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No policies found matching your search' : 'No policies available'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
