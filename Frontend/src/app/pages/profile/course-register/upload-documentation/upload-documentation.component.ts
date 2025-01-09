import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

import { DataService } from '../../../../core/services/data.service';

// Interface para las filas de la tabla
interface DocumentRow {
  id: number;
  name: string;
  filePath: string;
}

@Component({
  selector: 'app-upload-documentation',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltipModule,
    MatChipsModule,
    MatChip,
    MatTableModule,
    CommonModule,
  ],
  templateUrl: './upload-documentation.component.html',
  styleUrl: './upload-documentation.component.scss',
})
export class UploadDocumentationComponent implements OnInit {
  fileMap: { [key: number]: File | null } = {};
  displayedColumns: string[] = ['icon', 'name', 'files'];
  dataSource = new MatTableDataSource<DocumentRow>([]);

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadDocumentTemplates();
  }

  loadDocumentTemplates(): void {
    this.dataService.getDocumentTemplates().subscribe({
      next: (data: DocumentRow[]) => {
        this.dataSource.data = data.map((item) => ({
          id: item.id,
          name: item.name,
          filePath: item.filePath,
        }));
      },
      error: (err) => {
        console.error('Error loading document templates:', err);
      },
    });
  }

  onInputChange(event: any, fileIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      this.fileMap[fileIndex] = file;
    }
  }

  removeFile(fileIndex: number): void {
    this.fileMap[fileIndex] = null;
  }

  getFile(fileIndex: number): File | null {
    return this.fileMap[fileIndex] || null;
  }
}
