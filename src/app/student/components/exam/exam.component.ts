import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DoctorService } from 'src/app/doctor/services/doctor.service';

@Component({
  selector: 'app-exam',
  templateUrl: './exam.component.html',
  styleUrls: ['./exam.component.scss']
})
export class ExamComponent implements OnInit {

  id:any;
  subject:any;
  subject2:any;
  subject3:any;
  message2:any

  message1:any;
  subjects:any[] = [];
  filteredSubjects:any[] = [];

  user:any;
  studentInfo:any
  total:number = 0;
  showResult:boolean = false;
  usersubjects:any[] = [];
  validExam:boolean = true;
  constructor(private route:ActivatedRoute , private service:DoctorService ,private auth :AuthService,
     private toaster:ToastrService) {
    this.id = this.route.snapshot.paramMap.get('id')
    this.getSubject()
    this.getLogedInUser()
    
   }
   getSubjects() {
    this.service.getAllSubjects().subscribe((res:any) => {
      this.subjects = res
      this.filteredSubjects = this.subjects.filter(item =>
        item.name !== this.subject?.name
      );
      this.subject2=this.filteredSubjects[0].name
      this.subject3=this.filteredSubjects[1].name

      this.message2 = ` ${this.subject2} +" و "+ ${this.subject3}  😄 لسه اللي جاي `;

    })
  }
  ngOnInit(): void {

   this.getSubjects()
    const options1: Partial<IndividualConfig> = { timeOut: 15000 };


    setTimeout(() => {    


      setTimeout(() => {    
      
        this.toaster.info(this.message2, "", options1);
  
        
  
  
        
      }, 17000);
      
      this.toaster.info(this.message1, "", options1);

      


      
    }, 5000);
  }

  getSubject() {
    this.service.getSubject(this.id).subscribe(res => {
      this.subject = res
      this.message1 = ` ${this.subject?.name}     يتم احتساب الوقت حاليالأمتحان `;
      
      


    })
  }

  getLogedInUser() {
    this.auth.getRole().subscribe(res=> {
      this.user = res
      this.getUserData()
    })
  }

  getUserData() {
    this.auth.getStudent(this.user.userId).subscribe((res:any) => {
      this.studentInfo = res
      this.usersubjects = res?.subjects ?  res?.subjects : [];
      this.checkValidExam()
    })
  }

  getAnswer(event:any) {
    let value = event.value,
        questionIndex = event.source.name;
        this.subject.questions[questionIndex].studentAnswer = value
    console.log(this.subject.questions)
  }
  
  checkValidExam() {
    for(let x in this.usersubjects) { 
      if(this.usersubjects[x].id == this.id) {
        this.total = this.usersubjects[x].degree
         this.validExam = false;
         this.toaster.warning("لقد انجزت هذا الاختبار مسبقا")
      }
    }
  }

  delete(index:number) {
    this.subject.questions.splice(index , 1)
    const model = {
      name:this.subject.name,
      questions:this.subject.questions
    }
    
    this.service.updateSubject(model , this.id).subscribe(res => {
      this.toaster.success("تم حذف السؤال بنجاح")
    })
  }  

  getResult() {
    this.total = 0
    for(let x in this.subject.questions) {
      if(this.subject.questions[x].studentAnswer == this.subject.questions[x].correctAnswer) {
        this.total++
      }
    }
    this.showResult = true

if(this.subject.questions.length==this.total){
  
  this.toaster.success("مبروك الدرجه الكاملة ")
}else{
  
  this.toaster.warning("سيتم اعلامكم بالنتيجة فور التصحيح")
}

    this.usersubjects.push({
      name:this.subject.name,
      id:this.id,
      degree:this.total
    })
    const model = {
      username: this.studentInfo.username,
      email: this.studentInfo.email,
      password: this.studentInfo.password,
      subjects : this.usersubjects
    }
    this.auth.updateStudent(this.user.userId , model).subscribe(res => {
      

      setTimeout(() => {

        this.toaster.success("نم تسجيل النتيجه بنجاح")
        
      }, 5000);

    })
    console.log(this.total)
    
  }

  
}
