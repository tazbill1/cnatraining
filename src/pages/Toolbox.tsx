import { Wrench, FileText, ClipboardList, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  status: "available" | "coming-soon";
  category: "forms" | "calculators" | "checklists";
}

const tools: Tool[] = [
  {
    id: "cna-form",
    name: "CNA Form",
    description: "Interactive Customer Needs Analysis form with completion tracking and PDF download",
    icon: FileText,
    path: "/toolbox/cna-form",
    status: "available",
    category: "forms",
  },
  {
    id: "trade-worksheet",
    name: "Trade Worksheet",
    description: "6-step trade value calculation worksheet with ACV methodology",
    icon: ClipboardList,
    path: "/toolbox/trade-worksheet",
    status: "coming-soon",
    category: "forms",
  },
];

const categoryLabels = {
  forms: "Forms & Worksheets",
  calculators: "Calculators",
  checklists: "Checklists",
};

export default function Toolbox() {
  const navigate = useNavigate();

  const handleToolClick = (tool: Tool) => {
    if (tool.status === "available") {
      navigate(tool.path);
    }
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Toolbox</h1>
            </div>
            <p className="text-muted-foreground">
              Sales tools and resources to help you close more deals
            </p>
          </div>

          {/* Tools by Category */}
          <div className="space-y-8">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryTools.map((tool) => (
                    <Card
                      key={tool.id}
                      className={cn(
                        "transition-all duration-200",
                        tool.status === "available"
                          ? "cursor-pointer hover:border-primary/50 hover:shadow-md"
                          : "opacity-60 cursor-not-allowed"
                      )}
                      onClick={() => handleToolClick(tool)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                              tool.status === "available"
                                ? "bg-primary/10"
                                : "bg-muted"
                            )}
                          >
                            <tool.icon
                              className={cn(
                                "w-6 h-6",
                                tool.status === "available"
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">
                                {tool.name}
                              </h3>
                              {tool.status === "coming-soon" && (
                                <Badge variant="secondary" className="text-xs">
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {tool.description}
                            </p>
                          </div>
                          {tool.status === "available" && (
                            <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
