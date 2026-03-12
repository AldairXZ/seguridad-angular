import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaGrupo } from './vista-grupo';

describe('VistaGrupo', () => {
  let component: VistaGrupo;
  let fixture: ComponentFixture<VistaGrupo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaGrupo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaGrupo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
