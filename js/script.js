require("dotenv").config();

$(function () {
  const token = process.env.TOKEN;

  const mainContainer = document.getElementById("myData");

  getData(1);

  function getValue(numRecs) {
    fetch(
      "https://api.discogs.com/users/sean_mustache/collection/value?&token=" +
        token
    )
      .then((response) => response.json())
      .then((value) => createToolTip(value, numRecs));
  }

  function createTab(data, currentPage) {
    let tabContent = document.getElementById("myTabContent");
    let nav = document.getElementById("pagination");
    numberOfRecords(data);

    for (i = 1; i < data.pagination.pages; i++) {
      let li = document.createElement("li");
      li.className = "nav-item";
      let page = document.createElement("a");
      let num = i;
      let contentDiv = document.createElement("div");
      let tabPane = document.createElement("div");
      tabPane.className = "tab-pane fade";
      page.className = "nav-link page-button";
      page.href = "#contentDiv" + num;
      page.setAttribute("role", "pill");
      page.setAttribute("data-bs-toggle", "pill");

      contentDiv.className =
        "row col align-items-center mx-auto d-flex justify-content-center";
      contentDiv.id = "flex" + num;
      tabPane.id = "contentDiv" + i;
      tabPane.setAttribute("data-created", false);
      tabPane.setAttribute("role", "tabpanel");
      page.innerHTML = i;
      if (i == 1) {
        let num = i;
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
    createData(1);
  }
  function getData(currentPage) {
    console.log(token);
    fetch(
      "https://api.discogs.com/users/sean_mustache/collection/folders/0/releases?sort=artist&per_page=39&page=" +
        currentPage +
        "&token=" +
        token
    )
      .then((response) => response.json())
      .then((data) => createTab(data, currentPage));
  }
  function createData(currentPage) {
    if (document.readyState == "complete") {
      let divId = "flex" + currentPage;
      if (!document.getElementById(divId).hasChildNodes()) {
        fetch(
          "https://api.discogs.com/users/sean_mustache/collection/folders/0/releases?sort=artist&per_page=39&page=" +
            currentPage +
            "&token=" +
            token
        )
          .then((response) => response.json())
          .then((data) => appendData(data, currentPage));
      }
    }
  }
  function spinner(toggle) {
    $("#status").collapse(toggle);
  }

  function appendData(data, currentPage) {
    spinner("show");
    $(".tab-content").hide(400);

    let contentDiv = document.getElementById("flex" + currentPage);
    data.releases.forEach((release) => {
      let record = release;
      let card = document.createElement("div");
      card.className =
        "card col-12 col-md-5 col-lg-5 col-xl-3 bg-secondary m-3 pt-2";
      let image = document.createElement("img");
      card.onclick = function () {
        getModal(record.id);
      };
      card.id = "card-" + record.id;
      image.className = "card-img-top m-1";
      image.src = record.basic_information.cover_image;
      let div = document.createElement("div");
      let row = document.createElement("div");
      row.className = "row col-12";
      div.className = "card-body bg-secondary text-white col-7";
      div.innerHTML =
        "<strong>Artist:</strong><br>" +
        record.basic_information.artists[0].name.replace(/ ((\(\d)\)) */g, "") +
        "<br/>" +
        "<strong>Title:</strong><br>" +
        record.basic_information.title;
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
    setTimeout(function () {
      spinner("hide");
    }, 1400);
    setTimeout(function () {
      $(".tab-content").fadeIn("slow");
    }, 1700);
  }

  function numberOfRecords(data) {
    getValue(data.pagination.items);
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

  function getModal(discogsId) {
    console.log(discogsId);
    fetch(
      "https://api.discogs.com/releases/" + discogsId + "?usd&token=" + token
    )
      .then((response) => response.json())
      .then((individualData) => createModal(individualData));
  }

  function createModal(individualData) {
    console.log(individualData);
    let artistTitle = document.getElementById("modalTitle");
    artistTitle.innerHTML =
      "" +
      (individualData.artists[0].name + ": " + individualData.title).replace(
        / ((\(\d)\)) */g,
        ""
      );
    let link = document.getElementById("pageLink");
    link.href = individualData.uri;
    let img = document.getElementById("modalImage");
    img.src = individualData.images[0].uri;
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
        "No Video Available :(  <a href='https://www.youtube.com/results?search_query=" +
        (individualData.artists[0].name + " " + individualData.title)
          .replace(/ ((\(\d)\)) */g, "")
          .replace(/ (" ") */g, "+") +
        "' target='blank'> Click Here to search Youtube for videos </a>";
    }
    $("#releaseModal").modal("show");
  }

  function hideModal() {
    $("#releaseModal").modal("hide");
  }

  function clearScreen(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
});
