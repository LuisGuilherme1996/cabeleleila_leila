import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { DashboardStatsApiDto } from '../adapter/admin-dashboard.adapter';

@Injectable({ providedIn: 'root' })
export class AdminDashboardApi {
  private readonly api = inject(ApiService);

  getStats(): Observable<DashboardStatsApiDto> {
    return this.api.get<DashboardStatsApiDto>('/admin/dashboard');
  }
}
