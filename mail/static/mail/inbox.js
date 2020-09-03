document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  load_mailbox('inbox');
});
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('.view-email').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  recipient = document.querySelector('#compose-recipients');
  subject = document.querySelector('#compose-subject');
  body = document.querySelector('#compose-body');
  document.querySelector('form').onsubmit = function (){
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient.value,
      subject: subject.value,
      body: body.value,
      read: false,
    })
  })
    .then(response => response.json())
    .then(result => {
      if (result.message !=="Email sent successfully."){
        alert(result.error);
      }
    });
};
}
function view_email(id,mailbox){
  // id = button.dataset.id;
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('.view-email').style.display = 'block';
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
    fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
        document.querySelector('.view-email').innerHTML = `<h3>From: ${email.sender}</h3>
          <h5> Time: ${email.timestamp}</h5>
          <h5> Subject: ${email.subject}</h5>
          <p> Message: ${email.body}</p>`;
        if (mailbox!=="sent"){
        if(email.archived === true){
          const achived_btn = document.createElement('button');
          achived_btn.setAttribute('class','btn btn-primary');
          achived_btn.innerHTML = 'UnAchived';
          achived_btn.addEventListener('click', () => unarchived(email.id));
          document.querySelector('.view-email').append(achived_btn);
        }
        else{
          const achived_btn = document.createElement('button');
          achived_btn.setAttribute('class', 'btn btn-primary');
          achived_btn.innerHTML = 'Achived';
          achived_btn.addEventListener('click', () => archived(email.id));
          document.querySelector('.view-email').append(achived_btn);
        }
        }
        const reply_btn = document.createElement('button');
        reply_btn.setAttribute('class', 'btn btn-primary');
        reply_btn.innerHTML = 'reply';
        document.querySelector('.view-email').append(reply_btn);
        reply_btn.addEventListener('click',()=>reply_mail(email));
      });
    }
function archived(id){
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
    });
    load_mailbox('archive');
}
function unarchived(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
    });
  load_mailbox('inbox');
}
function reply_mail(email) {
  let subject = email.subject;
  if (!subject.startsWith("Re:")) {
    subject = `Re: ${subject}`
  }
  compose_email();
  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `${subject}`;
  document.querySelector('#compose-body').value = `\nOn ${email.timestamp} ${email.sender} wrote:\n\n ${email.body}`;
}
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('.view-email').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(item => {
        const element = document.createElement('div');
        if (mailbox==="sent"){
        element.innerHTML = `<div class="card" style="width: 99%;">
        <div class="card-body">
         <h5 class="card-title">${item.recipients}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${item.timestamp}</h6>
          <p class="card-text">${item.subject}</p>
        </div>
        </div>`;
        }
        else{
        element.innerHTML = `<div class="card" style="width: 99%; margin:20px;">
        <div class="card-body">
         <h5 class="card-title">${item.sender}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${item.timestamp}</h6>
          <p class="card-text">${item.subject}</p>
        </div>
        </div>`;
          if (item.read === true) {
            element.style.backgroundColor = 'gray';
          }
          else {
            element.style.backgroundColor = 'white';
          }
        }
        element.addEventListener('click', () => view_email(item.id, mailbox));
        document.querySelector('#emails-view').append(element);
        
      });
      // ... do something else with emails ...
    });
}
