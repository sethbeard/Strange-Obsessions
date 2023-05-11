$(function () {
  //token used for all of the api calls
  // this makes sure the pagination is hidden on load since it takes a second to create all of the tabs
  $("#pagination").hide();

  // this calls the main function to start creating everything
  getData(1);

  // was having trouble with the modal close button so added this to fix it.
  let modalButton = document.getElementById("closeModal");
  modalButton.addEventListener("click", function () {
    $("#releaseModal").modal("hide");
  });

  // this is the first API call.  This is mainly to get the initial data for the number of pages present in the json file.   Once called, it sends it over to the createTab option.
  function getData(currentPage) {
    fetch("https://strange-obsessions-be.glitch.me/getRecords/" + currentPage)
      .then((response) => response.json())
      .then((data) => createTab(data));
  }

  //this function creates all of the tabs and all of the tab-panes for the site.

  function createTab(data) {
    //this is the main tab div (the container that holds all of the tab panes)
    let tabContent = document.getElementById("myTabContent");
    let nav = document.getElementById("pagination");
    //starts getting the number of records and the values to create the small pop-up
    numberOfRecords(data);

    // creates a tab and a tab-pane for the number of pages reported back in the json file
    for (i = 1; i <= data.pagination.pages; i++) {
      let li = document.createElement("li");
      li.className = "nav-item";

      let num = i;

      let contentDiv = document.createElement("div");
      contentDiv.className =
        "row col align-items-center mx-auto d-flex justify-content-center";
      contentDiv.id = "flex" + num;

      let tabPane = document.createElement("div");
      tabPane.className = "tab-pane fade";
      tabPane.id = "contentDiv" + num;
      tabPane.setAttribute("data-created", false);
      tabPane.setAttribute("role", "tabpanel");

      let page = document.createElement("a");
      page.className = "nav-link page-button";
      page.href = "#contentDiv" + num;
      page.setAttribute("role", "pill");
      page.setAttribute("data-bs-toggle", "pill");
      page.innerHTML = num;

      if (i == 1) {
        tabPane.className += " show active";
        page.className += " active";
        page.onclick = function () {
          createData(num);
        };
      } else {
        page.onclick = function () {
          createData(num);
        };
      }

      tabPane.appendChild(contentDiv);
      tabContent.appendChild(tabPane);
      li.appendChild(page);
      nav.appendChild(li);
    }

    $("#pagination").fadeIn("slow");
    appendData(data, 1);
  }

  //checks if the page has been made yet and if not then runs the appendData option which creates the cards for the page.
  function createData(currentPage) {
    if (document.readyState == "complete") {
      let divId = "flex" + currentPage;
      if (!document.getElementById(divId).hasChildNodes()) {
        fetch(
          "https://strange-obsessions-be.glitch.me/getRecords/" + currentPage
        )
          .then((response) => response.json())
          .then((data) => appendData(data, currentPage));
      }
    }
  }
  const getImageUrl = async (url, discogsId) => {
    let imgURL = await fetch(
      "https://strange-obsessions-be.glitch.me/image/?url=" +
        url +
        "&discogsId=" +
        discogsId
    );
    let x = await imgURL.text();
    return x;
  };
  //quick function to toggle the spinner
  function spinner(toggle) {
    $("#status").collapse(toggle);
  }

  // the main function for creating each card.  Starts by hiding the tab-content area and showing the spinner
  const appendData = async (data, currentPage) => {
    spinner("show");
    $(".tab-content").hide(400);
    let contentDiv = document.getElementById("flex" + currentPage);
    data.releases.forEach(async (record) => {
      let card = document.createElement("div");
      card.className =
        "card col-12 col-md-5 col-lg-5 col-xl-3 bg-secondary m-3 pt-2";
      card.onclick = function () {
        getModal(record.id);
      };
      card.id = "card-" + record.id;

      let div = document.createElement("div");
      div.className = "card-body bg-secondary text-white col-7";
      div.innerHTML =
        "<strong>Artist:</strong><br>" +
        record.basic_information.artists[0].name.replace(/ ((\(\d)\)) */g, "") +
        "<br/>" +
        "<strong>Title:</strong><br>" +
        record.basic_information.title;

      let row = document.createElement("div");
      row.className = "row col-12";

      let image = document.createElement("img");
      image.className = "card-img-top m-1";
      let imgURL = getImageUrl(record.basic_information.cover_image, record.id);
      image.src = await imgURL;
      image.onError =
        "this.onerror=null; this.src=https://strange-obsessions-be.glitch.me/" +
        record.id +
        ".jpg";

      image.referrerPolicy = "no-referrer";

      //Pulls the genre information and writes it to the card.  Since genres can be endless, it picks the first three.
      let genres = "";
      for (
        let i = 0;
        i < record.basic_information.styles.length && i < 3;
        i++
      ) {
        genres += "<br/>" + record.basic_information.styles[i];
      }
      let genreDiv = document.createElement("div");
      genreDiv.className = "text-end col-5 text-white bg-secondary card-body";
      genreDiv.innerHTML = "<strong>Genres:</strong>" + genres;

      card.appendChild(image);
      row.appendChild(div);
      row.appendChild(genreDiv);
      card.appendChild(row);
      contentDiv.appendChild(card);
    });
    //hides the spinner and then shows the tab-pane area
    setTimeout(function () {
      spinner("hide");
    }, 1400);
    setTimeout(function () {
      $(".tab-content").fadeIn("slow");
    }, 1700);
  };

  //gets the number of records and the value of the collection and sends them to create the tooltip.

  function numberOfRecords(data) {
    let numRecs = data.pagination.items;
    fetch("https://strange-obsessions-be.glitch.me/value")
      .then((response) => response.json())
      .then((value) => createToolTip(value, numRecs));
  }

  function createToolTip(value, numRecs) {
    let toolTip = document.getElementById("toolTip");
    toolTip.innerHTML =
      "Number of Records: " +
      numRecs +
      "<br>Collection Value: <br> Low: " +
      value.minimum +
      " <br> Median: " +
      value.median +
      "  <br>Maximum: " +
      value.maximum;
  }

  //gets the data for the modal of the release clicked
  function getModal(discogsId) {
    fetch("https://strange-obsessions-be.glitch.me/releases/" + discogsId)
      .then((response) => response.json())
      .then((individualData) => createModal(individualData));
  }

  function createModal(individualData) {
    let artistTitle = document.getElementById("modalTitle");
    artistTitle.innerHTML =
      "" +
      (individualData.artists[0].name + ": " + individualData.title).replace(
        / ((\(\d)\)) */g,
        ""
      );
    let link = document.getElementById("pageLink");
    link.href = individualData.uri;
    console.log(individualData);
    let img = document.getElementById("modalImage");
    img.src = individualData.images[0].uri150;
    img.onerror =
      "this.onerror=null; this.src=https://strange-obsessions-be.glitch.me/" +
      individualData.id +
      ".jpg";
    img.height = "100";
    let mediaBody = document.getElementById("mediaBody");
    mediaBody.innerHTML =
      "Release Date: " +
      individualData.year +
      "<br/>Label: " +
      individualData.labels[0].name +
      "<br/>Lowest Price Available: <a target='blank' href= 'https://www.discogs.com/sell/release/" +
      individualData.id +
      "'>$" +
      individualData.lowest_price +
      "</a>";
    let videoDiv = document.getElementById("video");

    if (individualData.videos != undefined) {
      let videoURL = individualData.videos[0].uri.split("v=");

      videoDiv.innerHTML =
        '<iframe width="100%" height="356" src="https://www.youtube.com/embed/' +
        videoURL[1] +
        '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    } else {
      videoDiv.innerHTML =
        "No Video Available :( <br> <a href='https://www.youtube.com/results?search_query=" +
        (individualData.artists[0].name + " " + individualData.title)
          .replace(/ ((\(\d)\)) */g, "")
          .replace(/ (" ") */g, "+") +
        "' target='blank'> Click Here to search Youtube for videos </a>";
    }
    $("#releaseModal").modal("show");
  }
});
