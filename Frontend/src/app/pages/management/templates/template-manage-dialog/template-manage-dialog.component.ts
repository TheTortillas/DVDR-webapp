import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-template-manage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: './template-manage-dialog.component.html',
  styleUrl: './template-manage-dialog.component.scss',
})
export class TemplateManageDialogComponent implements OnInit {
  form: FormGroup;
  modalidades = ['schooled', 'non-schooled', 'mixed'];
  modalidadesMap: { [key: string]: string } = {
    schooled: 'Escolarizada',
    'non-schooled': 'No escolarizada',
    mixed: 'Mixta',
  };
  selectedFile: File | null = null;
  isUrlType = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TemplateManageDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      templateId?: number;
      type: string;
      template?: any;
    }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      docType: ['file', Validators.required],
      required: [true],
      modalities: [[]],
      filePath: [''],
    });
  }

  ngOnInit() {
    if (this.data.template) {
      this.form.patchValue({
        name: this.data.template.name,
        docType: this.data.template.type,
        required: this.data.template.required,
        filePath: this.data.template.filePath,
        modalities: this.data.template.modalities,
      });
      this.isUrlType = this.data.template.type === 'url';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = new FormData();
      formData.append('action', this.data.templateId ? 'UPDATE' : 'INSERT');
      if (this.data.templateId) {
        formData.append('templateId', this.data.templateId.toString());
      }
      formData.append('type', this.data.type);
      formData.append('name', this.form.get('name')?.value);
      formData.append('required', this.form.get('required')?.value);

      if (this.isUrlType) {
        formData.append('filePath', this.form.get('filePath')?.value);
      } else if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      if (this.data.type === 'course' && this.form.get('modalities')?.value) {
        formData.append(
          'modalities',
          JSON.stringify(this.form.get('modalities')?.value)
        );
      }

      this.dialogRef.close(formData);
    }
  }
}
