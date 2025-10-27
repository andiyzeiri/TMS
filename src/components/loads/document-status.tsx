"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Plus,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface DocumentStatus {
  document_type: string;
  has_document: boolean;
  upload_status: string;
  uploaded_at: string | null;
  is_required: boolean;
  requirement_message: string | null;
}

interface DocumentStatusSummary {
  load_id: string;
  documents: DocumentStatus[];
  summary: {
    total_required: number;
    completed_required: number;
    all_required_complete: boolean;
    can_create_invoice: boolean;
  };
}

interface DocumentStatusProps {
  loadId: string;
}

const DOCUMENT_TYPES = [
  { value: "POD", label: "Proof of Delivery" },
  { value: "BOL", label: "Bill of Lading" },
  { value: "INVOICE", label: "Invoice" },
  { value: "RECEIPT", label: "Receipt" },
  { value: "PHOTO", label: "Photo" },
  { value: "MANIFEST", label: "Manifest" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "OTHER", label: "Other" },
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function DocumentStatus({ loadId }: DocumentStatusProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch document status
  const { data: documentStatus, isLoading: statusLoading } = useQuery<DocumentStatusSummary>({
    queryKey: ["load-documents", loadId],
    queryFn: async () => {
      const response = await apiClient.get(`/loads/${loadId}/documents/status`);
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate MD5 checksum for a file
  const calculateMD5 = async (file: File): Promise<string> => {
    const crypto = await import('crypto-js');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const wordArray = crypto.lib.WordArray.create(arrayBuffer);
        const hash = crypto.MD5(wordArray).toString();
        resolve(hash);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      documentType,
    }: {
      file: File;
      documentType: string;
    }) => {
      setUploading(true);

      try {
        // Calculate checksum
        const checksum = await calculateMD5(file);

        // Step 1: Get upload URL
        const uploadResponse = await apiClient.post(`/loads/${loadId}/documents/upload-url`, {
          document_type: documentType,
          filename: file.name,
          content_type: file.type,
          file_size: file.size,
          checksum_md5: checksum,
        });

        const { upload_url, fields, session_id } = uploadResponse.data;

        // Step 2: Upload to S3
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append("file", file);

        const uploadResult = await fetch(upload_url, {
          method: "POST",
          body: formData,
        });

        if (!uploadResult.ok) {
          throw new Error(`Upload failed: ${uploadResult.statusText}`);
        }

        // Step 3: Confirm upload
        await apiClient.post(`/loads/${loadId}/documents/confirm-upload`, {
          session_id,
        });

        return { success: true };
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded successfully",
        description: "The document has been uploaded and is being processed.",
      });
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadDocumentType("");
      queryClient.invalidateQueries({ queryKey: ["load-documents", loadId] });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to upload document";

      if (error.response?.data?.code === "DUPLICATE_DOCUMENT") {
        errorMessage = "This document has already been uploaded";
      } else if (error.response?.data?.code === "POD_REQUIRED") {
        errorMessage = "Proof of Delivery is required before uploading other documents";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF, image, or document file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile && uploadDocumentType) {
      uploadMutation.mutate({
        file: selectedFile,
        documentType: uploadDocumentType,
      });
    }
  };

  const getStatusIcon = (document: DocumentStatus) => {
    if (document.has_document) {
      if (document.upload_status === "COMPLETED" || document.upload_status === "VERIFIED") {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      }
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }

    if (document.is_required) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    return <FileText className="h-5 w-5 text-gray-400" />;
  };

  const getStatusBadge = (document: DocumentStatus) => {
    if (document.has_document) {
      switch (document.upload_status) {
        case "COMPLETED":
        case "VERIFIED":
          return <Badge className="bg-green-100 text-green-800">Uploaded</Badge>;
        case "PROCESSING":
          return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
        default:
          return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      }
    }

    if (document.is_required) {
      return <Badge className="bg-red-100 text-red-800">Required</Badge>;
    }

    return <Badge variant="outline">Optional</Badge>;
  };

  const formatDocumentType = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documentStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load document status</p>
        </CardContent>
      </Card>
    );
  }

  const { documents, summary } = documentStatus;
  const completionPercent = summary.total_required > 0
    ? Math.round((summary.completed_required / summary.total_required) * 100)
    : 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <CardDescription>
            {summary.completed_required} of {summary.total_required} required documents uploaded
          </CardDescription>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a document for this load. All documents are stored securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="document-type">Document Type</Label>
                <Select value={uploadDocumentType} onValueChange={setUploadDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file-upload">File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.tiff,.txt,.doc,.docx"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadDialogOpen(false);
                    setSelectedFile(null);
                    setUploadDocumentType("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadDocumentType || uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Completion</span>
            <span>{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>

        {/* Invoice creation status */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Invoice Creation</span>
          </div>
          <Badge className={summary.can_create_invoice ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
            {summary.can_create_invoice ? "Ready" : "Pending POD"}
          </Badge>
        </div>

        {/* Document list */}
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.document_type}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(document)}
                <div>
                  <p className="font-medium text-sm">
                    {formatDocumentType(document.document_type)}
                  </p>
                  {document.uploaded_at && (
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                    </p>
                  )}
                  {document.requirement_message && !document.has_document && (
                    <p className="text-xs text-muted-foreground">
                      {document.requirement_message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(document)}
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No document requirements for this load</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}