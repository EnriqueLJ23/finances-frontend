import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit{

  dashboardService = inject(DashboardService);
  data = this.dashboardService.loadedData;

  ngOnInit() {
    this.dashboardService.loadData().subscribe({
      next: (data) => console.log(data)   
    }
    )
  }

}
