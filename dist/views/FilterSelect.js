var RRRemarkChromeExtension = {};

(function ($) {
  
  var DOWN_KEY = 40,
      UP_KEY = 38,
      ENTER_KEY = 13;
  
  var select = document.querySelector('.rrremarkSelector'),
      $search = $("rrremarkSelector--search"),
      selectInput = select.querySelector('.rrremarkSelector--searchInput'),
      options = select.querySelector('.rrremarkSelector--options'),
      $mainOption = $('.rrremarkSelector--option-selected'),
      $options = $(".rrremarkSelector--options"),
      $selectedOption;
  
  var isSelectActive = false, // Is it already open?
      numTimesDownPressed = 0; // How many times has the down key been pressed?
  
  function setMainOption() {
    $mainOption.attr('data-stack', $selectedOption.attr('data-stack'));
    $mainOption.html($selectedOption.attr('data-stack'));

    $('[data-selected="selected"]').removeAttr('data-selected');
    $selectedOption.attr('data-selected', 'selected');

    $(selectInput).val("");
    $(selectInput).blur();

    select.setAttribute('data-state', 'closed');
    isSelectActive = false;
    RRRemarkChromeExtension.isFilterSelectFocused = false;
    
    $options.children().each(function () {
      // Remove that HTML styling.
      $(this).html($(this).attr('data-stack'));

      // Make sure they show up again.
      $(this).removeClass('hidden');

      // Remove data-state so a new option gets selected.
      $(this).removeAttr('data-state');
    });

    numTimesDownPressed = 0;
  }
  
  function setFirstHighlightedOption() {
    if ($options.children('[data-state~="highlighted"]').length <= 0) {
        $selectedOption = $options.children('[data-stack~="' + $mainOption.attr('data-stack') + '"]');
        $selectedOption.attr('data-state', 'highlighted');
      }
  }
  
  function toggleSelectMenu() {
    if ( $(select).attr('data-state') === 'open') {
      $(select).attr('data-state', 'closed');
      isSelectActive = false;
      selectInput.blur();
      RRRemarkChromeExtension.isFilterSelectFocused = false;
    } else {
      $(select).attr('data-state', 'open');
      isSelectActive = true;
      selectInput.focus();
      RRRemarkChromeExtension.isFilterSelectFocused = true;
      setFirstHighlightedOption();
    }
  }
  
  $mainOption.click(function (e) {
    toggleSelectMenu();
  });
  
  $options.children().click(function () {
    var $option = $(this);
    
    if ( $option.attr('data-state') && $option.attr('data-state') === 'highlighted') {
      setMainOption();
      $(document).trigger('rrremarkChromeExtension.complete');
      RRRemarkChromeExtension.isFilterSelectFocused = false;
    }
    
  });
  
  $options.children().mouseover(function () {
    $selectedOption = $(this);
    
    $options.children().each(function () {
      if ( $(this).attr('data-state') && $(this).attr('data-state') === 'highlighted') {
        $(this).removeAttr('data-state');
      }
    });
    
    $selectedOption.attr('data-state', 'highlighted');
    
  });
  
  $(document).click(function(event) { 
    if( ! $(event.target).closest('.rrremarkSelector').length) {
      
      if ( $(select).attr('data-state') === 'open') {
        $(select).attr('data-state', 'closed');
        RRRemarkChromeExtension.isFilterSelectFocused = false;
      }
      
    }
    
    if ( $(event.target).closest('.rrremarkSelector--search').length) {
      $(selectInput).focus();
      RRRemarkChromeExtension.isFilterSelectFocused = true;
    }
  });
  
  document.addEventListener('keyup', function (e) {
    
    var key = e.keyCode || e.which;
    
    $selectedOption = $('[data-state~="highlighted"]').first();
    
    if ( ! isSelectActive) { // Open it if it's not already.
      
      if (key === DOWN_KEY) {
        isSelectActive = true;
        numTimesDownPressed++;
        select.setAttribute('data-state', 'open');
      }
      
    }
    
    if (isSelectActive) {
      
      // Find the option that is equal to what is in the selected field,
      // and scroll the option to go to that section.
      
      // Give focus to the input field.
      selectInput.focus();
      RRRemarkChromeExtension.isFilterSelectFocused = true;
      
      // Set the initial option that gets focus if there isn't one already.
      setFirstHighlightedOption();
      
      if (key === DOWN_KEY || key === UP_KEY) {
        
        // Pressing the down key the first time triggers this too. Here's a solution.
        if (key === DOWN_KEY && numTimesDownPressed <= 1) {
          numTimesDownPressed++;
          return;
        } else {
          $selectedOption.removeAttr('data-state');
          
          if (key === DOWN_KEY) {
            
            do {
              $selectedOption = $selectedOption.next().length ? $selectedOption.next() : $selectedOption = $options.children().first();
            } while ($selectedOption.hasClass('hidden'));
          } else { // UP key
            
            do {
              $selectedOption = $selectedOption.prev().length ? $selectedOption.prev() : $selectedOption = $options.children().last();
            } while ($selectedOption.hasClass('hidden'));
            
          }
          
          $selectedOption.attr('data-state', 'highlighted');
          
        }
        
      }
      
      // Sets the selected option.
      if (key === ENTER_KEY) {
        
        if ($selectedOption.attr('data-stack') === $mainOption.attr('data-stack')) {
          return;
        } else {
          setMainOption();
          // I need to trigger an event right here.
          // Also, don't forget to switch out the reference to the script in what you're working on.
          
          $(document).trigger('rrremarkChromeExtension.complete');
          RRRemarkChromeExtension.isFilterSelectFocused = false;
        }
      }
      
    }
  });
  
  // Filtering the options inside of here.
  $(selectInput).keyup(function (e) {
    
    var currentInputValue = $(this).val();
    
    $options.children().each(function (index, element) {
      
      var optionText = $(element).text(),
          searchIndex;
      
      $(element).removeClass('noBorder');
      
      // Hide the options that don't match the text.
      if (optionText.indexOf(currentInputValue) <= -1) {
        if ( ! $(element).hasClass('hidden')) {
          $(element).addClass('hidden');
        }
      } else {
        $(element).removeClass('hidden');
      }
      
      // Bold the letters of the search in the options that are left.
      if (optionText.indexOf(currentInputValue) >= 0) {
        var newArray = [],
            highlightedText = optionText.split(currentInputValue).join("<span class='highlightSearchValue'>" + currentInputValue + "</span>");
        
        $(element).html(highlightedText);
      }
    });
    
    // If there's no longer a highlighted element, highlight the first one.
    if ($options.children('[data-state~="highlighted"]').first().hasClass('hidden')) {
      $options.children('[data-state~="highlighted"]').first().removeAttr('data-state');
      $options.children(":not(.hidden)").first().attr('data-state', 'highlighted');
    }
    
    // Ensures there's always SOME element selected even if there are no matches.
    if ( ! $options.children('[data-state~="highlighted"]').length) {
      $options.children(":not(.hidden)").first().attr('data-state', 'highlighted');
    }
    
    // Remove the bottom border from the search div if there isn't any search results.
    if ($options.children().not('.hidden').length <= 0) {
      $('.rrremarkSelector--search').addClass('noBorder');
    } else {
      $('.rrremarkSelector--search').removeClass('noBorder');
    }
    
    $options.children(":not(.hidden)").last().addClass('noBorder');
    
    if ($options.children(":not(.hidden)").length <= 0) {
      $('.rrremarkSelector--search').addClass('noSearchResults');
    } else {
      $('.rrremarkSelector--search').removeClass('noSearchResults');
    }
    
  });
  
  // Prevents the caret position from moving if up or down is pressed.
  $(selectInput).keydown(function (e) {
    if (e.keyCode === 38 || e.keyCode === 40) {
      return false;
    }
  });
  
})(jQuery);