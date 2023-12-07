/**
 * Created by Ashar on 7/1/2020.
 */

let LIMIT = 10;
let OFFSET = 0;
let RATE_LIMIT = 10;
let RATE_OFFSET = 0;
let EVENT_DATA_TYPE = 0;
let SEARCH = '';
let TYPE = '';
let STATUS = '';
let REVIEW_STATUS = '';


Organization = function (data) {
    this.organization_delete_url = data.organization_delete_url;
    this.event_url = data.event_url;
    this.event_data = null;
    this.user_id = data.user_id;
    this.event_detail_bool = data.event_detail_bool;
    this.loader = data.loader;
    this.pk = data.pk;
    this.profile_image = data.profile_image;
    const self = this;


    // Init Events Data
    if (!self.event_detail_bool) {
        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET, EVENT_DATA_TYPE));
        self.event_data = $("#organization-data");
    } else {
        self.event_data = $("#detail-id");
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), false, 'all-review')
    }

    $("#add-organization").on('click', function () {
        $("#create-organization-modal").modal('show');
        $("#organization-create").trigger("reset");
        let edit = $("#edit");
        edit.addClass("d-none");
        $("#submit").removeClass("d-none");
    });

    $("#file").on('change', function(){
        previewImage();
    })

    // Delete Organization
    self.event_data.on('click', '.delete-organization', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "All the data will be lost.",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: "red"
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.value) {
                self.change_status(self.organization_delete_url, $(this).attr("data-pk"), false);
            }
        })
    });

        // Delete Review
    $("#all-review").on('click', '.delete-remarks', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "all the data will be lost",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: "red"
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.value) {
                self.change_status(`/api/organization/${self.pk}/rate-organization/delete`, $(this).attr("data-pk"));
            }
        })
    });
        $("#pending-review").on('click', '.delete-remarks', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "all the data will be lost",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: "red"
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.value) {
                self.change_status(`/api/organization/${self.pk}/rate-organization/delete`, $(this).attr("data-pk"));
            }
        })
    });
        $("#approved-review").on('click', '.delete-remarks', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "all the data will be lost",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: "red"
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.value) {
                self.change_status(`/api/organization/${self.pk}/rate-organization/delete`, $(this).attr("data-pk"));
            }
        })
    });

    // self.init_organization_form();
    // Submit Organization Creation
    $("#submit").on('click', function () {
        self.event_data_submit(self.event_url);
    });

    // Edit organization pop-up
    self.event_data.on('click', '.edit-organization', function () {
        let data = JSON.parse(decodeURIComponent($(this).attr("data-pk")));
        $("#organization-create").trigger("reset");
        $("#create-organization-modal").modal('show');
        // Append Data
        $("#name").val(data.name);
        $("#type").val(data.type);
        $("#description").summernote('code', data.description);
        let img = $("#preview");
        console.log(data.file);
        img.attr("src", data.file);
        img.css('display', 'block');
        $("#delete-image").removeClass('d-none')


        let edit = $("#edit");
        $("#password").parent().addClass('d-none');
        edit.removeAttr("data-pk");
        $("#submit").addClass("d-none");
        edit.removeClass("d-none");
        edit.attr("data-pk", data.id);
    });


    // Edit Data Submit
    $("#edit").on("click", function () {
        let id = $(this).attr("data-pk");
        self.event_data_submit(self.event_url + id, "PUT");
    });

    // Load More
    self.event_data.on('click', '.load-more', function () {
        OFFSET = LIMIT + OFFSET;
        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET, EVENT_DATA_TYPE), true);
    });

    // Load More
    $("#all-review").on('click', '.load-more-review', function () {
        RATE_OFFSET = RATE_LIMIT + RATE_OFFSET;
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), true, 'all-review')
    });

    // Load More
    $("#pending-review").on('click', '.load-more-review', function () {
        RATE_OFFSET = RATE_LIMIT + RATE_OFFSET;
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), true, 'pending-review')
    });

    // Load More
    $("#approved-review").on('click', '.load-more-review', function () {
        RATE_OFFSET = RATE_LIMIT + RATE_OFFSET;
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), true, 'approved-review')
    });

        // Load More
    $("#all-review").on('click', '.approve-remarks', function () {
        self.change_status(`/api/organization/${self.pk}/rate-organization/approved`, $(this).attr("data-pk"));
    });

    // Load More
    $("#pending-review").on('click', '.approve-remarks', function () {
        self.change_status(`/api/organization/${self.pk}/rate-organization/approved`, $(this).attr("data-pk"));
    });

    // Load More
    $("#approved-review").on('click', '.approve-remarks', function () {
        self.change_status(`/api/organization/${self.pk}/rate-organization/approved`, $(this).attr("data-pk"));
    });

    $("#all-tab").on('click', function(){
        RATE_OFFSET = 0;
        RATE_LIMIT = 10;
        REVIEW_STATUS = '';
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), false, 'all-review')
    });

    $("#approved-tab").on('click', function(){
        RATE_OFFSET = 0;
        RATE_LIMIT = 10;
        REVIEW_STATUS = 'true';
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), false, 'approved-review')
    });
    $("#pending-tab").on('click', function(){
        RATE_OFFSET = 0;
        RATE_LIMIT = 10;
        REVIEW_STATUS = 'false';
        self.init_review_data(self.pk, self.create_rating_url(RATE_LIMIT, RATE_OFFSET), false, 'pending-review')
    });

    $("#delete-image").on('click', function(){
       $("#preview").css('display', 'none')
       $(this).addClass("d-none");
        ("#file").val('');
    });

    $("#filter_search").on('keyup', function(){
        SEARCH = $(this).val()
        console.log(SEARCH);
        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET));
    });
    $("#filter_type").on('change', function(){
        TYPE = $(this).val()
        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET));
    });
    $("#filter_status").on('change', function(){
        STATUS = $(this).val()
        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET));
    });
};

Organization.prototype.event_data_submit = function (url, type = 'POST') {
    var file = $('#file')[0];
    let self = this;
    let name = $("#name").val();
    let type_val = $("#type").val();
    let description = $("#description")
    if (!name) {
        genericSweetAlert("Error", "Name is required", 'error')
        return
    }
    if (!type_val) {
        genericSweetAlert("Error", "Type is required", 'error')
        return
    }
    if (type === 'POST'){
        if (!file) {
            genericSweetAlert("Error", "File is required", 'error')
            return
        }
    }
    if (description.summernote('isEmpty')){
        genericSweetAlert("Error", "Description is required", 'error')
        return
    }

    var sign_up_data = new FormData();
    sign_up_data.append('name', name);
    if (file.files[0] != undefined){
        sign_up_data.append('file', file.files[0]);
    }
    sign_up_data.append('type', type_val);
    sign_up_data.append('description', description.summernote('code'));

    // loadingSweetAlert(title = 'Please wait');
    $.ajax({
        url: url, // the endpoint
        type: type, // http method
        processData: false,
        contentType: false,
        data: sign_up_data,
        // data: $('#add-content-form').formSerialize(),
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },

        success: function (json) {
            if (type === "PUT") {
                $("#organization-create").trigger("reset");
                let edit = $("#edit");
                edit.addClass("d-none");
                $("#submit").removeClass("d-none");
            }

            if (json['success'] == true) {
                $("#create-organization-modal").modal('hide');
                genericSweetAlert(title = 'Success', text = json['description'], type = 'success').then((function () {
                    if (!self.event_detail_bool) {
                        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET, EVENT_DATA_TYPE));
                    } else {
                        location.reload()
                    }
                }));
            }
        },
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("Authorization", "Token " + getCookie('u-at'));
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        },

        // handle a non-successful response
        error: error_function
    });
}

Organization.prototype.init_organization_form = function(submitHandlerFunction){
    $("#create-organization").validate({
        rules:{
            name: "required",
            type: "required",
            file: {
                "required": true,
                accept: "image/jpg,image/jpeg,image/png,image/gif"
            }
        },
        messages:{
            file: {
                accept: 'A valid image is required for the logo'
            }
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
                template += `<div class="text-center no-organization w-100 my-5">No records are found</div>`
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

Organization.prototype.append_event_data_template = function (i, creator = false) {
    let self = this;
    let buttons = `<a href="/admin/organization-detail/${i.id}" target="_blank" class="btn btn-warning mx-1 my-auto"><i
                            class="fa fa-eye"></i></a>`;
    let slugify = encodeURI(JSON.stringify(i));
    buttons += `<button data-pk="${slugify}" class="btn btn-info mx-1 edit-organization"><i
                    class="fa fa-pencil-alt"></i></button>
            <button data-pk="${i.id}" class="btn btn-danger mx-1 delete-organization"><i
                    class="fa fa-trash"></i></button>`;
    // let slugify = encodeURI(JSON.stringify(i));
    // buttons += `<div class="rate">
    //             <input type="radio" id="star5" name="rate" value="5" />
    //             <label for="star5" title="star5" data-pk="${i.id}" class="start" data-value="5">5 stars</label>
    //              <input type="radio" id="star4" name="rate" value="4" />
    //             <label for="star4" title="star4" data-pk="${i.id}" class="start" data-value="4">4 stars</label>
    //             <input type="radio" id="star3" name="rate" value="3" />
    //             <label for="star3" title="star3" data-pk="${i.id}" class="start" data-value="3">3 stars</label>
    //             <input type="radio" id="star2" name="rate" value="2" />
    //             <label for="star2" title="star2" data-pk="${i.id}" class="start" data-value="2">2 stars</label>
    //             <input type="radio" id="star1" name="rate" value="1" />
    //             <label for="star1" title="star1" data-pk="${i.id}" class="start" data-value="1">1 star</label>
    //           </div>`;

    return `<div class="card d-flex p-3 my-3 mx-2 event justify-content-between flex-row overflow-hidden flex-wrap">
                <div class="d-flex flex-column event-meta-data card-body">
                                <p>
                    <span class="ml-auto badge ${i.is_active?'badge-success':'badge-danger'}">${i.is_active?'Enabled':'Disabled'}</span>
                </p>
                    <div class="d-flex flex-column">
                        <div style="height: 200px; width: 100%; background-image: url(${i.file}); background-position:center; background-size: contain; background-repeat: no-repeat" >
                        </div>
                        <h4>${i.name}</h4>
                        <div class="d-flex justify-content-between">
                            <div class="my-auto type">${i.type}</div>
                            <div class="my-auto type">Pending Reviews: (${i.pending_review})</div>
                            <div class="my-auto type">${i.average_rating} (${i.total_rating}) <i class="fa fa-star" style="color: #ffc700"></i></div>
                        </div>
                    </div>
                    <div class="d-flex flex-row justify-content-end my-2 small-alert">
                        ${buttons}
                    </div>
                </div>
            </div>`;
}

Organization.prototype.append_rating_data_template = function (i, creator = false) {
    let self = this;
    let buttons = '';
    let slugify = encodeURI(JSON.stringify(i));
    if (!i.is_approved){
        buttons += `<button data-pk="${i.id}" class="btn btn-info mx-1 approve-remarks"><i
                    class="fa fa-check"></i></button>`;
    }
    buttons += `
            <button data-pk="${i.id}" class="btn btn-danger mx-1 delete-remarks"><i
                    class="fa fa-trash"></i></button>`;


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
                <div class="d-flex justify-content-end">
                    ${buttons}
                </div>
            </div>`;
}

Organization.prototype.change_status = function (url, id, is_review=true) {
    const self = this;
    loadingSweetAlert(title = 'Please Wait');
    $.ajax({
        url: url + "/" + id, // the endpoint
        type: "GET", // http method
        headers: {},
        success: function (json) {
            // console.log(json['success'])
            if (json['success'] == true) {
                genericSweetAlert(title = 'Success', text = json['description'], type = 'success').then((function () {
                    if (is_review){
                        window.location.reload();
                    }
                    if (!self.event_detail_bool) {
                        self.init_data(self.event_url, self.create_url(LIMIT, OFFSET));

                    } else {
                        window.location.href = "/admin/organization"
                    }
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
    return `?limit=${limit}&offset=${offset}&search=${SEARCH}&type=${TYPE}&org_status=${STATUS}`;
}

Organization.prototype.create_rating_url = function (limit = 10, offset = 0) {
    return `?limit=${limit}&offset=${offset}&review_status=${REVIEW_STATUS}`;
}

function previewImage() {
    var input = $('#file')[0];
    var preview = $('#preview');
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        $("#delete-image").removeClass('d-none')
        reader.onload = function(e) {
            preview.attr('src', e.target.result);
            preview.css('display', 'block');
        };

        reader.readAsDataURL(input.files[0]);
    }
}