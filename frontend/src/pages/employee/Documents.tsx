import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { FileText, Download, Trash2, Upload, AlertCircle, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

type Document = {
  id: string;
  employee_id: string;
  doc_type: string;
  file_url: string;
  uploaded_at: string;
};

const documentSchema = z.object({
  doc_type: z.string().min(2, "Document type is required"),
  file_url: z.string().url("Must be a valid URL"),
});

type DocumentFormData = z.infer<typeof documentSchema>;

const DOC_TYPES = [
  "Offer Letter",
  "ID Proof",
  "Address Proof",
  "Degree Certificate",
  "Experience Letter",
  "Relieving Letter",
  "Other"
];

export default function EmployeeDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  const uploadDocType = watch("doc_type");

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents/me");
      setDocuments(res.data);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onUpload = async (data: DocumentFormData) => {
    if (!user) return;
    setErrorMsg(null);
    setIsUploading(true);
    try {
      await api.post("/documents", {
        employee_id: user.id,
        doc_type: data.doc_type,
        file_url: data.file_url,
      });
      reset({ file_url: "" });
      fetchDocuments();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Documents</h1>
        <p className="text-muted-foreground mt-1">Manage your personal and compliance documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleSubmit(onUpload)} className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={uploadDocType} onValueChange={(val) => setValue("doc_type", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doc_type && (
                  <p className="text-xs text-destructive">{errors.doc_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>File URL</Label>
                <Input placeholder="https://example.com/doc.pdf" {...register("file_url")} />
                {errors.file_url && (
                  <p className="text-xs text-destructive">{errors.file_url.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isUploading} className="w-full mt-2">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card className="lg:col-span-2 shadow-sm flex flex-col min-h-[500px]">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Document Vault</CardTitle>
              <CardDescription>View and manage uploaded files.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col h-64 items-center justify-center text-muted-foreground text-sm">
                <FileText className="h-12 w-12 mb-3 text-muted/30" />
                No documents found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary/70" />
                          {doc.doc_type}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(doc.id)}>
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
      </div>
    </div>
  );
}
