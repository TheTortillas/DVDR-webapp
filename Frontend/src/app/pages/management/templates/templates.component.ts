import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  TemplatesService,
  TemplatesResponse,
} from '../../../core/services/templates.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TemplateManageDialogComponent } from './template-manage-dialog/template-manage-dialog.component';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesComponent implements OnInit {
  templates?: TemplatesResponse;
  loading = true;
  error = false;

  constructor(
    private templatesService: TemplatesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    this.templatesService.getAllTemplates().subscribe({
      next: (data) => {
        this.templates = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.error = true;
        this.loading = false;
        this.snackBar.open('Error al cargar las plantillas', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  openManageDialog(templateId?: number, type?: string) {
    const dialogRef = this.dialog.open(TemplateManageDialogComponent, {
      data: {
        templateId,
        type,
        template: templateId ? this.findTemplate(templateId, type) : null,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.templatesService.manageTemplate(result).subscribe({
          next: () => {
            this.snackBar.open('Plantilla guardada exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.loadTemplates();
          },
          error: (error) => {
            console.error('Error:', error);
            this.snackBar.open('Error al guardar la plantilla', 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  private findTemplate(id: number, type?: string) {
    if (!type || !this.templates) return null;

    switch (type) {
      case 'course':
        return this.templates.courseTemplates.find((t) => t.id === id);
      case 'diploma':
        return this.templates.diplomaTemplates.find((t) => t.id === id);
      case 'certificate':
        return this.templates.certificateTemplates.find((t) => t.id === id);
      default:
        return null;
    }
  }

  createTemplateUrl(filePath: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(filePath);
  }
}
