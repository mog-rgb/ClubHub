/**
 * Created by Ashar on 7/1/2020.
 */

let LIMIT = 10;
let OFFSET = 0;
let RATE_LIMIT = 10;
let RATE_OFFSET = 0;
let EVENT_DATA_TYPE = 0;
let SEARCH = '';
let RATING = 0;
let REVIEW_STATUS = 'true';

Organization = function (data) {
    this.organization_delete_url = data.organization_delete_url;
    this.event_url = data.event_url;
    this.event_data = null;
    this.user_id = data.user_id;
    this.event_detail_bool = data.event_detail_bool;
    this.loader = data.loader;
    this.pk = data.pk;
    this.validate_form = null;
    this.profile_image = data.profile_image;
    const self = this;

    console.log(self.event_detail_bool);

    self.event_data = $("organization-data");

    // Init Events Data
    if (!self.event_detail_bool) {
        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET));
        self.event_data = $("#organization-data");
    }else{
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), false, 'review-data')
    }

    $(".start").on('click', function () {
        RATING = $(this).attr("data-value");
        console.log(RATING);
    });

    // Load More
    self.event_data.on('click', '.load-more', function () {
        OFFSET = LIMIT + OFFSET;
        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET), true);
    });

    // Load More
    $("#review-data").on('click', '.load-more-review', function () {
        RATE_OFFSET = RATE_LIMIT + RATE_OFFSET;
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), true, 'review-data')
    });

    $("#add-new-review").on('click', function(){
       $("#create-review-modal").modal('show');
    });

    $("#is_anonymous").on('click', function(){
        self.validate_form.resetForm();
        if($(this).is(":checked")){
            $("#name").attr("disabled","true")
            $("#email").attr("disabled","true")
        }else{
            $("#name").removeAttr("disabled")
            $("#email").removeAttr("disabled")
        }
    });

    self.init_organization_form(function(e){
        // e.preventDefault();
        self.rate_event(self.pk)
    });

    $("#submit").on('click', function(){
        $("#rating-create").submit()
    });

    $("#searchInput").on('keyup', function(){
        SEARCH = $(this).val();
        if (SEARCH.length > 0){
            $(".search-results").css('display', 'block')
        }else{
            $(".search-results").css('display', 'none')
        }
        self.fetch_data(self.event_url, self.create_url(LIMIT, OFFSET));
    });

          // Event listener for document click
      $(document).on('click', function (event) {
        // Check if the clicked element is outside the search container
        if (!$(event.target).closest('.search-container').length) {
            $(".search-results").css('display', 'none')
        }
      });

      $("#searchResults").on('click', '.result-item', function(){
         let val = $(this).attr('data-href');
         if (val !== undefined){
             window.location.href = val;
         }
      });

      $(".search-anchor").on('click', function(){
          LIMIT = 10;
          OFFSET = 0;
          $(".search-results").css('display', 'none');
          self.init_data(self.event_url, self.create_url(LIMIT, OFFSET));
      });
};

Organization.prototype.init_organization_form = function(submitHandlerFunction){
    let self = this;
    self.validate_form = $("#rating-create").validate({
        rules: {
          name: {
            required: function () {
              // Check if the checkbox is checked
              return !$('#is_anonymous').is(':checked');
            }
          },
          email: {
            required: function () {
              // Check if the checkbox is checked
              return !$('#is_anonymous').is(':checked');
            }
          },
            remarks: {
              required: true
            }
        },
        messages: {
          field1: 'This field is required when the checkbox is checked',
          field2: 'This field is required when the checkbox is checked'
        },
        // errorClass: "text-danger",
        onfocusout: true,
        // Submit handler if form is valid
          submitHandler: submitHandlerFunction
    })
}

Organization.prototype.init_data = function (url, query_parameter = "?", load_more_flag = false) {
    const self = this;

    $("#organization-data").append(`<div class="text-center gif-loader w-100"><img src="${self.loader}" /></div`);
    $.ajax({
        url: url + query_parameter, // the endpoint
        type: "GET", // http method
        headers: {},
        success: function (json) {
            let template = ``;
            if (json.count) {
                json.payload.map(i => {
                    template += self.append_event_data_template(i, self.user_id === i.user);
                });
            } else {
                template += `<div class="text-center no-event w-100 my-5">No records are found</div>`
                $("#organization-data").html(template);
                return;
            }
            let load_more = `<div class="text-center w-100 load-more-div"><button class="btn btn-outline-primary load-more" data-offset="${OFFSET}">Load More</button></div>`
            $(".gif-loader").remove();
            $(".no-organization").remove();
            if (!load_more_flag) {
                $("#organization-data").html(template + load_more);
            } else {
                $(".load-more-div").remove();
                $("#organization-data").append(template + load_more);
            }
            if (LIMIT + OFFSET > json.count){
                $(".load-more-div").remove();
            }

            self.showing_items("organization-data", LIMIT+ OFFSET, json.count)
        },
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        // handle a non-successful response
        error: error_function
    });
};

Organization.prototype.init_review_data = function (id, query_parameter = "?", load_more_flag = false, div_contain='') {
    const self = this;
    $(`#${div_contain}`).append(`<div class="text-center gif-review-loader w-100"><img src="${self.loader}" /></div`);
    $.ajax({
        url: `/api/organization/${id}/rate-organization${query_parameter}`, // the endpoint
        type: "GET", // http method
        headers: {},
        success: function (json) {
            let template = ``;
            if (json.count) {
                json.payload.map(i => {
                    template += self.append_rating_data_template(i, self.user_id === i.user);
                });
            } else {
                template += `<div class="text-center no-review w-100 my-5">No records are found</div>`
                $(`#${div_contain}`).html(template);
                return;
            }
            let load_more = `<div class="text-center w-100 load-review-more-div"><button class="btn btn-outline-primary load-more-review" data-offset="${OFFSET}">Load More</button></div>`
            $(".gif-review-loader").remove();
            $(".no-review").remove();
            if (!load_more_flag) {
                $(`#${div_contain}`).html(template + load_more);
            } else {
                $(".load-review-more-div").remove();
                $(`#${div_contain}`).append(template + load_more);
            }
            if (RATE_LIMIT + RATE_OFFSET > json.count){
                $(".load-review-more-div").remove();
            }

            self.showing_items(div_contain, RATE_OFFSET+RATE_LIMIT, json.count)
        },
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        // handle a non-successful response
        error: error_function
    });
};

Organization.prototype.append_rating_data_template = function (i, creator = false) {
    let self = this;
    let buttons = '';
    let user_content = "Anonymous User"
    if (!i.is_anonymous){
        user_content = `<h6 class="mb-0">${i.name}</h6>
                        <h6><i>${i.email}</i></h6>`;
    }
    let rating = `<div class="d-flex flex-row">`;
    for(j=1; j <= 5; j++){
        if (j <= i.rating) {
            rating += `<i class="fa fa-star" style="color: #ffc700"></i>`;
        }else{
            rating += `<i class="fa fa-star" style="color: #ccc"></i>`;
        }
    }
    rating += `</div>`;

    console.log(i);
    return `<div class="border my-3 rounded p-3">
                <div class="d-flex ">
                    <div class="d-flex flex-column flex-grow-0 px-2 py-1">
                        ${rating}
                        <img src="${self.profile_image}" width="70px"/>
                        ${user_content}
                    </div>
                    <div class="flex flex-row flex-grow-1 ml-3 py-3">
                        <p>${i.remarks}</p>
                    </div>
                </div>
            </div>`;
}

Organization.prototype.fetch_data = function (url, query_parameter = "?") {
    const self = this;
    $.ajax({
        url: url + query_parameter, // the endpoint
        type: "GET", // http method
        headers: {},
        success: function (json) {
            let template = ``;
            if (json.payload.length > 0){
                json.payload.map(i => {
                    template += `<div data-href="/organization/${i.slug}-${i.id}" class="result-item">${i.name}</div>`
                })
            }else{

                template += `<div class="result-item" >No Result Found</div>`
            }
            $("#searchResults").html(template);
        },
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        // handle a non-successful response
        error: error_function
    });
};

Organization.prototype.showing_items = function(div_container,showing=0, total=0){
    if (showing > total){
        showing = total;
    }
  $(`#${div_container}-count`).html(`<p>Showing ${showing} of ${total} items</p>`);
};

Organization.prototype.append_event_data_template = function (i, creator = false) {
    let self = this;
    return `<a href="/organization/${i.slug}-${i.id}" class="anchor-remove card d-flex p-3 my-3 mx-2 event justify-content-between flex-row overflow-hidden flex-wrap">
                <div class="d-flex flex-column event-meta-data card-body">
                    <div class="d-flex flex-column">
                        <div style="height: 200px; width: 100%; background-image: url(${i.file}); background-position:center; background-size: contain; background-repeat: no-repeat" >
                        </div>
                        <h4>${i.name}</h4>
                        <div class="d-flex justify-content-between">
                            <div class="my-auto type">${i.type}</div>
                            <div class="my-auto type">${i.average_rating} (${i.total_rating}) <i class="fa fa-star" style="color: #ffc700"></i></div>
                        </div>
                    </div>
                </div>
            </a>`;
}

Organization.prototype.rate_event = function (event_id) {
    const self = this;
    if (RATING===0){
        genericSweetAlert("Error", 'Please give some rating', 'error');
        return
    }
    var data = new FormData();
    data.append('name', $("#name").val());
    data.append('email', $("#email").val());
    data.append('remarks', $("#remarks").val());
    data.append('is_anonymous', $("#is_anonymous").is(":checked"));
    data.append('rating', RATING);
    // console.log($("#name").val())
    // return false
    loadingSweetAlert(title = 'Please Wait');
    $.ajax({
        url: `/api/organization/${event_id}/rate-organization`, // the endpoint
        type: "POST", // http method
        processData: false,
        contentType: false,
        data: data,
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        success: function (json) {
            // console.log(json['success'])
            if (json['success'] == true) {
                genericSweetAlert(title = 'Success', text = json['description'], type = 'success').then((function () {
                        location.reload();
                }));
            }
        },
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        },
        // handle a non-successful response
        error: error_function
    });
};

Organization.prototype.create_url = function (limit = 10, offset = 0) {
    return `?limit=${limit}&offset=${offset}&search=${SEARCH}`;
}

Organization.prototype.create_rating_url = function (limit = 10, offset = 0) {
    return `?limit=${limit}&offset=${offset}&review_status=${REVIEW_STATUS}`;
}

function previewImage() {
    var input = $('#file')[0];
    var preview = $('#preview');

    if (input.files && input.files[0]) {
        var reader = new FileReader();
        $("#delete-image").addClass('d-none')
        reader.onload = function(e) {
            preview.attr('src', e.target.result);
            preview.css('display', 'block');
        };

        reader.readAsDataURL(input.files[0]);
    }
}