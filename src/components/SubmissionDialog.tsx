import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X } from 'lucide-react';

interface SubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  taskId?: string;
  onSuccess?: (submission: {
    id: string;
    files: string[];
    comments: string;
    status: string;
    submitted_at: string;
  }) => void;
}

export function SubmissionDialog({ isOpen, onClose, assignmentId, taskId, onSuccess }: SubmissionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to submit",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create file URLs (in a real app, these would be uploaded to storage)
      const fileUrls = files.map(file => URL.createObjectURL(file));

      // Create submission object
      const submission = {
        id: Math.random().toString(36).substr(2, 9), // Generate a random ID
        files: fileUrls,
        comments,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      };

      onSuccess?.(submission);
      onClose();
      
      // Reset form
      setFiles([]);
      setComments('');
      
      toast({
        title: "Success",
        description: "Your submission has been added successfully",
      });
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Files</Label>
            <div className="mt-2">
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                className="mb-2"
              />
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label>Comments</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments about your submission..."
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 