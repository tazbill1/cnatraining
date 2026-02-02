import { FileText, Download, BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CNAFormDigital } from "@/components/learn/CNAFormDigital";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CNAForm() {
  const navigate = useNavigate();

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-8 max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/toolbox")}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Toolbox
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">CNA Form</h1>
            </div>
            <p className="text-muted-foreground">
              The Customer Needs Analysis form - your guide to understanding every customer
            </p>
          </div>

          <Tabs defaultValue="digital" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="digital" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Interactive Form
              </TabsTrigger>
              <TabsTrigger value="reference" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reference
              </TabsTrigger>
            </TabsList>

            <TabsContent value="digital">
              <CNAFormDigital />
            </TabsContent>

            <TabsContent value="reference">
              <div className="space-y-6">
                {/* Download Card */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Official CNA Form
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Download the official dealership Customer Needs Analysis form
                          </p>
                        </div>
                      </div>
                      <Button asChild>
                        <a href="/documents/CNA-Form.pdf" download>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* PDF Preview */}
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-[8.5/11] w-full bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src="/documents/CNA-Form.pdf"
                        className="w-full h-full"
                        title="CNA Form PDF"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      CNA Best Practices
                    </h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Complete it with the customer</strong> - This isn't a form you fill out after they leave. It's a conversation guide.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Follow the flow</strong> - The form is designed to naturally progress from rapport to needs to recommendations.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Rule of 2</strong> - Always prepare at least 2 vehicle recommendations based on their stated needs.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Use & Utility first</strong> - Understand how they'll use the vehicle before jumping to features or price.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>
                          <strong>Capture priorities</strong> - The "Most Important" section tells you what to emphasize in your presentation.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
